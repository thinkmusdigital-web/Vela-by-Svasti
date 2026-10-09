/**
 * In-memory sliding-window rate limiter.
 *
 * Suitable for a single-instance deployment (the documented MVP topology).
 * For multi-instance production, back this interface with Redis — the call
 * sites only depend on `consume()` and `reset()`.
 */

import { clientIp } from "@/lib/http";

type Window = { hits: number[] };

const buckets = new Map<string, Window>();
const MAX_BUCKETS = 10_000;

export interface RateLimitRule {
  /** max requests allowed inside the window */
  limit: number;
  /** window size in milliseconds */
  windowMs: number;
}

/** Drop expired/empty windows so long-lived processes stay bounded. */
function pruneExpired(now: number) {
  for (const [key, window] of buckets) {
    if (window.hits.length === 0 || now - window.hits[window.hits.length - 1] > 3_600_000) {
      buckets.delete(key);
    }
  }
}

export function consume(key: string, rule: RateLimitRule): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();
  let window = buckets.get(key);
  if (!window) {
    if (buckets.size >= MAX_BUCKETS) {
      pruneExpired(now);
      if (buckets.size >= MAX_BUCKETS) {
        // Keys are attacker-influenceable (IP strings); bound memory worst-case.
        const firstKey = buckets.keys().next().value as string | undefined;
        if (firstKey) buckets.delete(firstKey);
      }
    }
    window = { hits: [] };
  }
  window.hits = window.hits.filter((t) => now - t < rule.windowMs);

  if (window.hits.length >= rule.limit) {
    const oldest = window.hits[0];
    const retryAfterMs = rule.windowMs - (now - oldest);
    buckets.set(key, window);
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  window.hits.push(now);
  buckets.set(key, window);
  return { ok: true, retryAfterSec: 0 };
}

export function reset(key?: string) {
  if (key) buckets.delete(key);
  else buckets.clear();
}

/** Housekeeping so long-lived processes do not accumulate empty windows. */
setInterval(() => {
  const now = Date.now();
  for (const [key, window] of buckets) {
    if (window.hits.length === 0 || now - window.hits[window.hits.length - 1] > 3_600_000) {
      buckets.delete(key);
    }
  }
}, 600_000).unref?.();

export const RATE_LIMITS = {
  enquirySubmit: { limit: 5, windowMs: 10 * 60 * 1000 } satisfies RateLimitRule,
  login: { limit: 5, windowMs: 15 * 60 * 1000 } satisfies RateLimitRule,
  generalApi: { limit: 120, windowMs: 60 * 1000 } satisfies RateLimitRule,
} as const;

/**
 * Generic throttle for authenticated admin API traffic. Coarser than the
 * public submit/login limits; it exists so a logged-in caller cannot hammer
 * mutating endpoints or expensive reads without bound.
 */
export function adminRateLimit(request: Request): { ok: boolean; retryAfterSec: number } {
  return consume(`general:${clientIp(request)}`, RATE_LIMITS.generalApi);
}
