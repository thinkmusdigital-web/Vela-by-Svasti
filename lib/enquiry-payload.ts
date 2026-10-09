import {
  EVENT_TYPE_LABELS,
  PREFERRED_CONTACT_LABELS,
  PURPOSE_LABELS,
} from "@/lib/constants";
import type { EnquiryInput } from "@/lib/validate";

/**
 * All website enquiries are recorded against this source value so staff can
 * tell web submissions apart from walk-ins/phone calls added manually.
 */
export const ENQUIRY_SOURCE = "Website";

/**
 * The JSON object POSTed to the Google Apps Script web app. Property names
 * mirror the enquiry form fields; enum fields are sent as human-readable
 * labels because the target is a spreadsheet read by people.
 *
 * The deployed Apps Script must read this JSON from `e.postData.contents`.
 * See docs/GOOGLE_SHEETS_INTEGRATION.md for the expected contract.
 */
export interface EnquirySheetPayload {
  enquiryType: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  roomTypeId: string;
  roomType: string;
  numberOfRooms: number;
  purposeOfStay: string;
  specialRequest: string;
  preferredContact: string;
  source: string;
  companyName: string;
  eventType: string;
  expectedGuests: number | "";
  approximateBudget: string;
  preferredCallTime: string;
  /** Server-generated display reference, e.g. ENQ-20261009-A1B2. */
  reference: string;
  /** ISO-8601 submission timestamp. */
  submittedAt: string;
}

/** Formats a Date as a calendar day (YYYY-MM-DD); empty string when absent. */
export function toDayString(value?: Date | null): string {
  return value ? value.toISOString().slice(0, 10) : "";
}

/**
 * Builds a short, human-friendly reference shown on the success page.
 * The Apps Script may generate its own ID; if it returns one we prefer that.
 */
export function generateEnquiryReference(now: Date = new Date()): string {
  const day = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `ENQ-${day}-${random}`;
}

export interface BuildEnquiryPayloadOptions {
  /** Resolved room-type display name (looked up from the DB by the caller). */
  roomTypeName?: string;
  reference?: string;
  submittedAt?: Date;
}

export function buildEnquiryPayload(
  input: EnquiryInput,
  options: BuildEnquiryPayloadOptions = {},
): EnquirySheetPayload {
  const submittedAt = options.submittedAt ?? new Date();

  return {
    enquiryType: input.enquiryType,
    customerName: input.customerName,
    mobileNumber: input.mobileNumber,
    email: input.email,
    checkInDate: toDayString(input.checkInDate),
    checkOutDate: toDayString(input.checkOutDate),
    adults: input.adults,
    children: input.children,
    roomTypeId: (input.roomTypeId ?? "").trim(),
    roomType: options.roomTypeName ?? "",
    numberOfRooms: input.numberOfRooms,
    purposeOfStay: input.purposeOfStay ? (PURPOSE_LABELS[input.purposeOfStay] ?? input.purposeOfStay) : "",
    specialRequest: (input.specialRequest ?? "").trim(),
    preferredContact: PREFERRED_CONTACT_LABELS[input.preferredContact] ?? input.preferredContact,
    source: ENQUIRY_SOURCE,
    companyName: (input.companyName ?? "").trim(),
    eventType: input.eventType ? (EVENT_TYPE_LABELS[input.eventType] ?? input.eventType) : "",
    expectedGuests: input.expectedGuests ?? "",
    approximateBudget: (input.approximateBudget ?? "").trim(),
    preferredCallTime: (input.preferredCallTime ?? "").trim(),
    reference: options.reference ?? generateEnquiryReference(submittedAt),
    submittedAt: submittedAt.toISOString(),
  };
}

export interface SheetResponseResult {
  ok: boolean;
  /** Present when the Apps Script returns its own id/reference. */
  enquiryId?: string;
  error?: string;
}

const SUCCESS_TOKENS = ["success", "ok", "created", "saved", "added", "done"];
const FAILURE_TOKENS = ["error", "fail", "failed", "failure"];

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function matchesToken(value: unknown, tokens: string[]): boolean {
  return typeof value === "string" && tokens.includes(value.trim().toLowerCase());
}

/**
 * Decides whether an Apps Script response represents a confirmed save.
 *
 * Google Apps Script can answer in several shapes, so we accept the common
 * success markers ({ok:true}, {success:true}, {status:"success"}, a plain
 * "Success" body or a returned id) and treat everything else — including an
 * empty body, an HTML error/login page, a non-2xx status or an explicit
 * failure object — as NOT saved. This prevents showing a success message for
 * a request that did not actually persist the enquiry.
 */
export function interpretSheetResponse(response: {
  status: number;
  contentType?: string | null;
  text: string;
}): SheetResponseResult {
  if (response.status < 200 || response.status >= 300) {
    return { ok: false, error: `The enquiry service responded with HTTP ${response.status}.` };
  }

  const body = response.text.trim();
  if (!body) {
    return { ok: false, error: "The enquiry service returned an empty response." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    parsed = undefined;
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const object = parsed as Record<string, unknown>;
    const enquiryId =
      firstString(object.enquiryId, object.reference, object.id) ?? undefined;

    if (object.ok === false || object.success === false || matchesToken(object.status, FAILURE_TOKENS)) {
      return {
        ok: false,
        error:
          firstString(object.error, object.message) ??
          "The enquiry service reported an error while saving.",
      };
    }

    if (
      object.ok === true ||
      object.success === true ||
      matchesToken(object.status, SUCCESS_TOKENS) ||
      matchesToken(object.result, SUCCESS_TOKENS) ||
      enquiryId
    ) {
      return { ok: true, enquiryId };
    }

    return { ok: false, error: "The enquiry service returned an unrecognised response." };
  }

  // Plain-text responses such as "Success" or "OK".
  if (matchesToken(body, SUCCESS_TOKENS)) {
    return { ok: true };
  }

  return { ok: false, error: "The enquiry service returned an unexpected response." };
}
