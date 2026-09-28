export const WAITLIST_SOURCES = ["hero", "final-cta"] as const;
export type WaitlistSource = (typeof WAITLIST_SOURCES)[number];

export type WaitlistAttribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landing_path: string | null;
};

export type WaitlistStatus =
  | "joined"
  | "already_joined"
  | "invalid"
  | "rate_limited"
  | "error";

export type WaitlistResponse = { status: WaitlistStatus };
