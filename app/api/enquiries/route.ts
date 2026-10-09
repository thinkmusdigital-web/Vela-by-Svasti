import { clientIp, json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { consume, RATE_LIMITS } from "@/lib/rate-limit";
import { enquiryInputSchema, formatZodErrors } from "@/lib/validate";
import { buildEnquiryPayload } from "@/lib/enquiry-payload";
import { submitEnquiryToSheet } from "@/lib/google-sheets";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Public enquiry submission.
 *
 * Flow: browser form → this same-origin proxy → Google Apps Script → Google
 * Sheets. The database is NOT used to store enquiries any more; it is only
 * queried to resolve the room-type display name for the spreadsheet.
 *
 * The form must only show success after this handler confirms the Apps Script
 * actually saved the row, so any non-confirmed result returns an error status.
 */
export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return jsonError("We could not verify your request. Please refresh the page and try again.", 400);
  }

  const ip = clientIp(request);
  const limited = consume(`enquiry:${ip}`, RATE_LIMITS.enquirySubmit);
  if (!limited.ok) {
    return jsonError(
      "You have submitted several enquiries recently. Please try again in a few minutes or contact us directly.",
      429,
      { retryAfter: limited.retryAfterSec },
    );
  }

  const body = await readJson(request);

  if (
    body &&
    typeof body === "object" &&
    "website" in body &&
    String((body as { website?: unknown }).website ?? "").length > 0
  ) {
    // Honeypot triggered — a bot filled the hidden field. Report success so the
    // bot does not retry, but do NOT forward anything to Google Sheets.
    return json({ enquiryId: "ENQ-PENDING", honeypot: true }, 201);
  }

  const parsed = enquiryInputSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Please correct the highlighted fields.", 400, {
      fieldErrors: formatZodErrors(parsed.error),
    });
  }

  // Resolve the room-type name for the spreadsheet. A lookup failure must not
  // block the enquiry, so it degrades to a blank room type.
  let roomTypeName = "";
  if (parsed.data.roomTypeId) {
    try {
      const roomType = await prisma.roomType.findFirst({
        where: { id: parsed.data.roomTypeId, active: true },
        select: { name: true },
      });
      roomTypeName = roomType?.name ?? "";
    } catch (error) {
      console.warn("Could not resolve room type for enquiry:", error);
    }
  }

  const payload = buildEnquiryPayload(parsed.data, { roomTypeName });
  const result = await submitEnquiryToSheet(payload);

  if (!result.ok) {
    console.error("Google Sheets enquiry submission failed:", result.error);
    return jsonError(
      "We could not submit your enquiry right now. Please try again in a moment or contact us directly.",
      502,
      { retryable: true },
    );
  }

  return json(
    {
      enquiryId: result.enquiryId || payload.reference,
      message: "Enquiry received. Our team will contact you shortly.",
      acknowledged: true,
      confirmed: false,
    },
    201,
  );
}
