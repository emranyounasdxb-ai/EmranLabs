import "server-only";

const MAX_KEYS = 500;
const MIN_HITS = 1;
const MAX_HITS = 120;
const MIN_WINDOW_MS = 10_000;
const MAX_WINDOW_MS = 60 * 60 * 1000;

type Bucket = { hits: number[] };

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfter: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export class SlidingWindowRateLimiter {
  private buckets = new Map<string, Bucket>();
  private readonly maxHits: number;
  private readonly windowMs: number;

  constructor(maxHits: number, windowMs: number) {
    this.maxHits = clamp(Math.floor(maxHits), MIN_HITS, MAX_HITS);
    this.windowMs = clamp(Math.floor(windowMs), MIN_WINDOW_MS, MAX_WINDOW_MS);
  }

  check(key: string, now = Date.now()): RateLimitResult {
    this.prune(now);
    const bucket = this.buckets.get(key) ?? { hits: [] };
    bucket.hits = bucket.hits
      .filter((hit) => now - hit < this.windowMs)
      .slice(-this.maxHits);
    if (bucket.hits.length >= this.maxHits) {
      const oldest = bucket.hits[0] ?? now;
      this.buckets.set(key, bucket);
      this.enforceMaxKeys();
      return {
        allowed: false,
        retryAfter: Math.max(
          1,
          Math.ceil((this.windowMs - (now - oldest)) / 1000),
        ),
      };
    }
    bucket.hits.push(now);
    this.buckets.set(key, bucket);
    this.enforceMaxKeys();
    return { allowed: true };
  }

  size() {
    return this.buckets.size;
  }

  private prune(now: number) {
    for (const [key, bucket] of this.buckets) {
      bucket.hits = bucket.hits
        .filter((hit) => now - hit < this.windowMs)
        .slice(-this.maxHits);
      if (bucket.hits.length === 0) this.buckets.delete(key);
    }
    this.enforceMaxKeys();
  }

  private enforceMaxKeys() {
    while (this.buckets.size > MAX_KEYS) {
      const oldestKey = this.buckets.keys().next().value as string | undefined;
      if (!oldestKey) break;
      this.buckets.delete(oldestKey);
    }
  }
}

export function envInt(
  name: string,
  fallback: number,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  const safe = Number.isFinite(value) && value > 0 ? value : fallback;
  return clamp(safe, min, max);
}

export const rateLimitBounds = {
  maxHits: { min: MIN_HITS, max: MAX_HITS },
  windowMs: { min: MIN_WINDOW_MS, max: MAX_WINDOW_MS },
};
