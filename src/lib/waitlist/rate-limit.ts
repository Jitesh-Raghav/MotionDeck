// In-memory sliding window. Each serverless instance keeps its own counts,
// so this stops casual abuse only. Move to a shared store (e.g. Upstash
// Redis) if the waitlist starts getting hammered.

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const MAX_TRACKED_KEYS = 5_000;

const hits = new Map<string, number[]>();

export function rateLimit(key: string, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    hits.set(key, recent);
    return { allowed: false, retryAfterSeconds: Math.ceil((recent[0] + WINDOW_MS - now) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_TRACKED_KEYS) {
    for (const [trackedKey, times] of hits) {
      if (times.every((time) => now - time >= WINDOW_MS)) hits.delete(trackedKey);
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function clientKey(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
