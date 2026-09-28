"use client";

import { track, type CtaLocation } from "@/lib/analytics/events";

export const FORM_IDS = {
  hero: "early-access",
  "final-cta": "waitlist",
} as const;

type JumpToFormProps = {
  target: keyof typeof FORM_IDS;
  /** Where this link sits on the page, for analytics. */
  location: CtaLocation;
  className?: string;
  children: React.ReactNode;
};

/** Link that scrolls to an email form and focuses its input. */
export function JumpToForm({ target, location, className, children }: JumpToFormProps) {
  const id = FORM_IDS[target];
  return (
    <a
      href={`#${id}`}
      className={className}
      onClick={(event) => {
        track("cta_click", { location });
        const input = document.getElementById(`${id}-email`);
        if (!input) return;
        event.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        input.closest("form")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "center",
        });
        input.focus({ preventScroll: true });
      }}
    >
      {children}
    </a>
  );
}
