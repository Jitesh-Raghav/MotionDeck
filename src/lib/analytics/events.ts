import { getAttribution } from "./attribution";

export type CtaLocation = "nav" | "hero" | "pricing" | "final";

/** Every event the site sends. Properties never include emails or typed text. */
export type AnalyticsEvents = {
  cta_click: { location: CtaLocation };
  example_chip_click: { topic: string };
  demo_generate_submit: { matched_example: boolean };
  motion_slider_used: Record<string, never>;
  section_view: { section: string };
  waitlist_submit: { location: CtaLocation };
  waitlist_success: { location: CtaLocation; already_joined: boolean };
  waitlist_error: { location: CtaLocation; reason: string };
};

type Sender = (event: string, properties: Record<string, unknown>) => void;

// Events fired before posthog-js has loaded wait here; if analytics turns out
// to be disabled they are dropped.
const MAX_QUEUE = 50;
let queue: [string, Record<string, unknown>][] | null = [];
let sender: Sender | null = null;
const fired = new Set<string>();

/** Called by the provider once posthog-js is ready, or with null when analytics is off. */
export function connectAnalytics(next: Sender | null) {
  sender = next;
  if (next) for (const [event, properties] of queue ?? []) next(event, properties);
  queue = null;
}

export function track<E extends keyof AnalyticsEvents>(event: E, properties: AnalyticsEvents[E]) {
  // Read attribution now so it is fixed at first interaction, not at flush time.
  getAttribution();
  if (sender) sender(event, properties);
  else if (queue && queue.length < MAX_QUEUE) queue.push([event, properties]);
}

/** Fires an event at most once per page load. */
export function trackOnce<E extends keyof AnalyticsEvents>(
  event: E,
  properties: AnalyticsEvents[E],
  key: string = event,
) {
  if (fired.has(key)) return;
  fired.add(key);
  track(event, properties);
}
