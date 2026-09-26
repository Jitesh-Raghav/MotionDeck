export const WAITLIST_SOURCES = ["hero", "final-cta"] as const;
export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export type WaitlistStatus =
  | "joined"
  | "already_joined"
  | "invalid"
  | "rate_limited"
  | "error";

export type WaitlistResponse = { status: WaitlistStatus };
