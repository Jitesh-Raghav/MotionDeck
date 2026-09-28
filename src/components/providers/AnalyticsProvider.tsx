"use client";

import { useEffect } from "react";
import { getAttribution } from "@/lib/analytics/attribution";
import { connectAnalytics } from "@/lib/analytics/events";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const ENABLED =
  Boolean(KEY) &&
  (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_POSTHOG_DEV === "true");

/**
 * Cookieless PostHog. State lives in memory only, autocapture is off, and
 * Do Not Track is respected. Events go through the /ingest rewrite so ad
 * blockers don't drop them. posthog-js is loaded after first render.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Snapshot utm_* and the referrer before anything else can change them.
    const attribution = getAttribution();
    if (!ENABLED || !KEY) {
      connectAnalytics(null);
      return;
    }

    let cancelled = false;
    void import("posthog-js").then(({ default: posthog }) => {
      if (cancelled) return;
      posthog.init(KEY, {
        api_host: "/ingest",
        ui_host: "https://us.posthog.com",
        persistence: "memory",
        capture_pageview: true,
        capture_pageleave: false,
        autocapture: false,
        respect_dnt: true,
        disable_session_recording: true,
        disable_surveys: true,
        // Every event, including the automatic pageview, carries attribution.
        before_send: (event) => {
          if (event) event.properties = { ...event.properties, ...attribution };
          return event;
        },
      });
      connectAnalytics((name, properties) => posthog.capture(name, properties));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return children;
}
