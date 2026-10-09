import { clientIp, json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { consume, RATE_LIMITS } from "@/lib/rate-limit";
import { enquiryInputSchema, formatZodErrors } from "@/lib/validate";
import { createEnquiry } from "@/lib/enquiry";

export const runtime = "nodejs";

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

  if (body && typeof body === "object" && "website" in body && String((body as { website?: unknown }).website ?? "").length > 0) {
    // Honeypot triggered — respond as a success without persisting anything.
    return json({ enquiryId: "ENQ-PENDING", honeypot: true }, 201);
  }

  const parsed = enquiryInputSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Please correct the highlighted fields.", 400, {
      fieldErrors: formatZodErrors(parsed.error),
    });
  }

  try {
    const result = await createEnquiry(parsed.data, { ip });
    return json(
      {
        enquiryId: result.enquiryId,
        possibleDuplicate: result.possibleDuplicate,
        message: "Enquiry received. Our team will contact you shortly.",
        acknowledged: true,
        confirmed: false,
      },
      201,
    );
  } catch (error) {
    console.error("Failed to create enquiry:", error);
    return jsonError(
      "Something went wrong while submitting your enquiry. Please try again or contact us directly.",
      500,
    );
  }
}