import { WAITLIST_SOURCES, type WaitlistSource } from "./types";

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
