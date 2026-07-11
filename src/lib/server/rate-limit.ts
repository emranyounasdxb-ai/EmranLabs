import "server-only";

const MAX_KEYS = 500;

type Bucket = { hits: number[] };

export type RateLimitResult =
  { allowed: true } | { allowed: false; retryAfter: number };

export class SlidingWindowRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(
    private readonly maxHits: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now = Date.now()): RateLimitResult {
    this.prune(now);
    const bucket = this.buckets.get(key) ?? { hits: [] };
    bucket.hits = bucket.hits.filter((hit) => now - hit < this.windowMs);
    if (bucket.hits.length >= this.maxHits) {
      const oldest = bucket.hits[0] ?? now;
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
    return { allowed: true };
  }

  private prune(now: number) {
    for (const [key, bucket] of this.buckets) {
      bucket.hits = bucket.hits.filter((hit) => now - hit < this.windowMs);
      if (bucket.hits.length === 0) this.buckets.delete(key);
    }
    while (this.buckets.size > MAX_KEYS) {
      const oldestKey = this.buckets.keys().next().value as string | undefined;
      if (!oldestKey) break;
      this.buckets.delete(oldestKey);
    }
  }
}

export function envInt(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
