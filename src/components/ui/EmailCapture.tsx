"use client";

import { useId, useRef, useState } from "react";
import { animate, m, useReducedMotion } from "motion/react";
import { Arrow, Beam, buttonClasses } from "@/components/ui/button";
import { FORM_IDS } from "@/components/ui/JumpToForm";
import { cn } from "@/lib/cn";
import { getAttribution } from "@/lib/analytics/attribution";
import { track, type CtaLocation } from "@/lib/analytics/events";
import { EASE } from "@/lib/motion";
import type { WaitlistResponse, WaitlistSource, WaitlistStatus } from "@/lib/waitlist/types";
import { isValidEmail } from "@/lib/waitlist/validate";

type FormState = "idle" | "submitting" | WaitlistStatus;

const LOCATIONS: Record<WaitlistSource, CtaLocation> = { hero: "hero", "final-cta": "final" };

const done = (state: FormState) => state === "joined" || state === "already_joined";

const errors: Partial<Record<FormState, string>> = {
  invalid: "That email doesn't look right. Please check it.",
  rate_limited: "Too many tries. Please wait a few minutes.",
  error: "Something went wrong on our side. Please try again.",
};

/**
 * Email and button in one 56px pill. The submit button is the single morphing
 * element: it shows a spinner while sending, then grows across the pill into
 * the success state with a checkmark and a burst of ember pixels. Errors shake
 * the pill and explain what happened below it.
 */
export function EmailCapture({
  source,
  hint,
  tone = "light",
  className,
}: {
  source: WaitlistSource;
  /** Shown under the pill until there's a message. */
  hint?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const id = FORM_IDS[source];
  const statusId = useId();
  const pillRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  // Where the success panel grows from: the button's share of the pill width.
  const [from, setFrom] = useState(0.3);
  const dark = tone === "dark";
  const location = LOCATIONS[source];
  const reduce = useReducedMotion();

  // A gentle three-step shake. Imperative, so the input keeps its focus.
  function fail(next: FormState) {
    setState(next);
    if (pillRef.current && !reduce) {
      animate(pillRef.current, { x: [0, -6, 5, -3, 0] }, { duration: 0.4, ease: "easeOut" });
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting" || done(state)) return;
    track("waitlist_submit", { location });
    if (!isValidEmail(email)) {
      track("waitlist_error", { location, reason: "invalid_email" });
      return fail("invalid");
    }

    setState("submitting");
    const company = new FormData(event.currentTarget).get("company");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company, ...getAttribution() }),
      });
      const data = (await response.json()) as WaitlistResponse;
      if (done(data.status)) {
        const pill = pillRef.current?.clientWidth ?? 1;
        setFrom((buttonRef.current?.offsetWidth ?? pill * 0.3) / pill);
        setState(data.status);
        setEmail("");
        track("waitlist_success", { location, already_joined: data.status === "already_joined" });
      } else {
        track("waitlist_error", { location, reason: data.status });
        fail(data.status in errors ? data.status : "error");
      }
    } catch {
      track("waitlist_error", { location, reason: "network" });
      fail("error");
    }
  }

  const error = errors[state];
  const message = done(state) ? "We'll email you as soon as it's ready." : (error ?? hint);

  return (
    <form id={id} noValidate onSubmit={onSubmit} className={cn("relative mx-auto w-full max-w-[500px]", className)}>
      <div
        ref={pillRef}
        className={cn(
          "group/pill relative flex h-14 items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-5 sm:pl-6",
          dark
            ? "border-stage-line bg-stage-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "border-hairline-strong bg-surface shadow-[0_1px_2px_rgba(11,11,12,0.04),0_12px_32px_-18px_rgba(11,11,12,0.25)]",
        )}
      >
        {/* Focus ring: fades and scales in around the whole pill. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-[4px] scale-[0.98] rounded-full border-2 opacity-0 transition-[opacity,transform] duration-300 ease-brand group-has-[input:focus-visible]/pill:scale-100 group-has-[input:focus-visible]/pill:opacity-100",
            dark ? "border-stage-ink/80" : "border-ink/80",
          )}
        />
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          disabled={done(state)}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setState("idle");
          }}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={statusId}
          className={cn(
            "h-full w-full min-w-0 flex-1 bg-transparent text-[16px] outline-none",
            dark ? "text-stage-ink placeholder:text-stage-muted" : "text-ink placeholder:text-muted",
          )}
        />
        <button
          ref={buttonRef}
          type="submit"
          disabled={state === "submitting"}
          onClick={() => track("cta_click", { location })}
          aria-label={state === "submitting" ? "Joining the waitlist" : undefined}
          className={buttonClasses({
            variant: dark ? "light" : "primary",
            className: cn("h-11 px-4 sm:px-5", done(state) && "pointer-events-none opacity-0"),
          })}
        >
          <Beam />
          <span className="grid place-items-center">
            <span
              className={cn(
                "col-start-1 row-start-1 flex items-center gap-2 transition-opacity duration-200",
                state === "submitting" && "opacity-0",
              )}
            >
              Get early access
              <Arrow className="hidden sm:block" />
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "col-start-1 row-start-1 size-5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-0 transition-opacity duration-200",
                state === "submitting" && "opacity-100",
              )}
            />
          </span>
        </button>

        {done(state) && <Success from={from} dark={dark} already={state === "already_joined"} />}
      </div>

      {/* Honeypot: hidden from people and assistive tech. */}
      <div className="honeypot" aria-hidden="true">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Height is reserved so messages never shift the layout. */}
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-3 flex min-h-6 items-center justify-center gap-2 text-[15px] leading-6",
          error ? (dark ? "text-stage-ink" : "text-ink") : dark ? "text-stage-muted" : "text-muted",
        )}
      >
        {error && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />}
        {done(state) && <span className="sr-only">{state === "joined" ? "You're on the list." : "You're already on the list."}</span>}
        {message}
      </p>
    </form>
  );
}

const BURST = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1);
  const distance = 34 + (i % 4) * 11;
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance * 0.8, size: i % 3 === 0 ? 6 : 4 };
});

/** The button grown across the pill: checkmark, message and a pixel burst. */
function Success({ from, dark, already }: { from: number; dark: boolean; already: boolean }) {
  return (
    <m.div
      aria-hidden="true"
      className={cn(
        "absolute inset-[6px] flex items-center justify-center gap-2.5 rounded-full text-[15px] font-medium",
        dark ? "bg-stage-ink text-ink" : "bg-[#1c1c1f] text-bg",
      )}
      initial={{ scaleX: from }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      style={{ originX: 1 }}
    >
      <m.span
        className="relative flex items-center gap-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <span className="relative grid size-6 place-items-center rounded-full bg-accent">
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <m.path
              d="M3.5 8.5l2.8 2.7 6.2-6.7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.35, duration: 0.45, ease: EASE }}
            />
          </svg>
          {BURST.map((pixel, index) => (
            <m.span
              key={index}
              className="absolute top-1/2 left-1/2 bg-accent"
              style={{ width: pixel.size, height: pixel.size, marginLeft: -pixel.size / 2, marginTop: -pixel.size / 2 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: pixel.x, y: pixel.y, opacity: 0, scale: 0.5 }}
              transition={{ delay: 0.4, duration: 0.75, ease: EASE }}
            />
          ))}
        </span>
        {already ? "You're already on the list" : "You're on the list"}
      </m.span>
    </m.div>
  );
}
