import "server-only";
import {
  interpretSheetResponse,
  type EnquirySheetPayload,
  type SheetResponseResult,
} from "@/lib/enquiry-payload";

/**
 * Default Google Apps Script Web App endpoint for website enquiries.
 *
 * Override with GOOGLE_APPS_SCRIPT_URL (server-side). NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL
 * is accepted as a fallback for compatibility, but the value is NOT secret
 * either way — keep it server-side so it never ships in client JavaScript.
 *
 * The Apps Script deployment MUST be shared as "Anyone" or the endpoint
 * redirects to Google sign-in and every submission fails.
 */
const DEFAULT_ENQUIRY_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbygYbefsHtNZhq3fL4EMs3SGpsWhazdgvWs394mt1FTds7Ylhajv_4F5O27nflOdzOOVg/exec";

/** Requests are aborted after this many milliseconds. */
const ENQUIRY_SUBMIT_TIMEOUT_MS = 15_000;

export function enquirySheetUrl(): string {
  return (
    process.env.GOOGLE_APPS_SCRIPT_URL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL?.trim() ||
    DEFAULT_ENQUIRY_SHEET_URL
  );
}

/**
 * Forwards a validated enquiry to the Google Apps Script Web App.
 *
 * We proxy through the Next.js server (rather than letting the browser call
 * Apps Script directly) because:
 *  - Apps Script does not send CORS headers, so a browser fetch could not read
 *    the response and could not confirm the save.
 *  - The server can time out, inspect the HTTP status and interpret the body.
 *
 * Apps Script redirects to a googleusercontent.com URL; `redirect: "follow"`
 * lets fetch land on the real response. Success is only reported when the
 * response body actually confirms the save (see interpretSheetResponse).
 */
export async function submitEnquiryToSheet(
  payload: EnquirySheetPayload,
): Promise<SheetResponseResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ENQUIRY_SUBMIT_TIMEOUT_MS);

  try {
    const response = await fetch(enquirySheetUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await response.text();
    return interpretSheetResponse({
      status: response.status,
      contentType: response.headers.get("content-type"),
      text,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { ok: false, error: "The enquiry service timed out. Please try again." };
    }
    return {
      ok: false,
      error: "We could not reach the enquiry service. Please try again in a moment.",
    };
  } finally {
    clearTimeout(timer);
  }
}
