import { NextResponse } from "next/server";

export const REQUEST_HEADER = "x-requested-with";
export const REQUEST_HEADER_VALUE = "vela-admin-panel";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/**
 * CSRF protection for state-changing API requests.
 *
 * 1. Every mutating request must carry a custom header that a cross-origin
 *    page cannot add without a CORS preflight (we never enable CORS).
 * 2. If an Origin header is present it must match the request host.
 *
 * The public enquiry form and the admin panel both send the header.
 */
export function assertSameOrigin(request: Request): boolean {
  const header = request.headers.get(REQUEST_HEADER);
  if (header !== REQUEST_HEADER_VALUE) return false;

  const origin = request.headers.get("origin");
  if (!origin) return true; // same-origin fetches may omit Origin; header check already applied
  try {
    const originHost = new URL(origin).host;
    const requestHost = request.headers.get("host") ?? new URL(request.url).host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}

/**
 * Best-effort real client IP for rate limiting.
 *
 * By default we ignore the client-supplied `x-forwarded-for` header, which an
 * attacker can spoof to rotate past per-IP limits. Only a trusted reverse
 * proxy that rewrites/overwrites the header should set TRUST_PROXY=1.
 */
export function clientIp(request: Request): string {
  if (process.env.TRUST_PROXY === "1") {
    const forwarded = request.headers.get("x-forwarded-for");
    const first = forwarded?.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
