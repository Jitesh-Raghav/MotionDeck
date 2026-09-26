import { clientKey, rateLimit } from "@/lib/waitlist/rate-limit";
import { StoreUnavailableError, addToWaitlist } from "@/lib/waitlist/store";
import type { WaitlistResponse, WaitlistStatus } from "@/lib/waitlist/types";
import { normalizeEmail, normalizeSource } from "@/lib/waitlist/validate";

const MAX_BODY_LENGTH = 2048;

function reply(status: WaitlistStatus, httpStatus: number, headers?: Record<string, string>) {
  return Response.json({ status } satisfies WaitlistResponse, {
    status: httpStatus,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request.headers));
  if (!limit.allowed) {
    return reply("rate_limited", 429, { "Retry-After": String(limit.retryAfterSeconds) });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) return reply("invalid", 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return reply("invalid", 400);
  }
  if (typeof body !== "object" || body === null) return reply("invalid", 400);

  // Honeypot: people never see this field, so anything in it is a bot.
  // Pretend it worked so the bot has nothing to learn from.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return reply("joined", 201);
  }

  const email = normalizeEmail(body.email);
  const source = normalizeSource(body.source);
  if (!email || !source) return reply("invalid", 400);

  try {
    const result = await addToWaitlist(email, source);
    return result === "joined" ? reply("joined", 201) : reply("already_joined", 200);
  } catch (error) {
    console.error("[waitlist]", error);
    return reply("error", error instanceof StoreUnavailableError ? 503 : 500);
  }
}
