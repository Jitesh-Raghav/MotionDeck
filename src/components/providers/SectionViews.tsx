"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/events";

// Section landmarks, by their accessible name, mapped to stable event values.
const SECTIONS: Record<string, string> = {
  "hero-title": "hero",
  "why-title": "why",
  "how-title": "how_it_works",
  "Slides made with Motiondeck": "slide_reel",
  "animations-title": "animations",
  "formats-title": "formats",
  "built-for-title": "built_for",
  "pricing-title": "pricing",
  "faq-title": "faq",
  "final-cta-title": "final_cta",
};

/** Sends section_view once per section as it scrolls into view. Renders nothing. */
export function SectionViews() {
  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const name = (entry.target as HTMLElement).dataset.sectionView;
          if (!name || seen.has(name)) continue;
          seen.add(name);
          observer.unobserve(entry.target);
          track("section_view", { section: name });
        }
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0 },
    );
    for (const element of document.querySelectorAll<HTMLElement>("main section")) {
      const key = element.getAttribute("aria-labelledby") ?? element.getAttribute("aria-label");
      const name = key && SECTIONS[key];
      if (!name) continue;
      element.dataset.sectionView = name;
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);
  return null;
}
