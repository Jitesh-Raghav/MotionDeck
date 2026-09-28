import { WAITLIST_SOURCES, type WaitlistAttribution, type WaitlistSource } from "./types";

// Deliberately simple: one @, no spaces, a dot in the domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length === 0 || email.length > 254) return null;
  return EMAIL_PATTERN.test(email) ? email : null;
}

export function isValidEmail(value: string) {
  return normalizeEmail(value) !== null;
}

export function normalizeSource(value: unknown): WaitlistSource | null {
  return WAITLIST_SOURCES.find((source) => source === value) ?? null;
}

const ATTRIBUTION_MAX_LENGTH = 200;
const ATTRIBUTION_FIELDS = ["utm_source", "utm_medium", "utm_campaign", "referrer", "landing_path"] as const;

/** Optional text field from the client: strings only, control characters removed, 200 chars max. */
function normalizeAttributionValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, ATTRIBUTION_MAX_LENGTH);
  return text === "" ? null : text;
}

export function normalizeAttribution(body: Record<string, unknown>): WaitlistAttribution {
  const result = {} as WaitlistAttribution;
  for (const field of ATTRIBUTION_FIELDS) result[field] = normalizeAttributionValue(body[field]);
  return result;
}
