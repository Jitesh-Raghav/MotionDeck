"use client";

import { useId, useState } from "react";
import { Arrow } from "@/components/ui/button";
import { FORM_IDS } from "@/components/ui/JumpToForm";
import { cn } from "@/lib/cn";
import type { WaitlistResponse, WaitlistSource, WaitlistStatus } from "@/lib/waitlist/types";
import { isValidEmail } from "@/lib/waitlist/validate";

type FormState = "idle" | "submitting" | WaitlistStatus;

const messages: Partial<Record<FormState, string>> = {
  joined: "You're on the list. We'll email you when it's ready.",
  already_joined: "You're already on the list. We'll be in touch.",
  invalid: "That email doesn't look right. Please check it.",
  rate_limited: "Too many tries. Please wait a few minutes.",
  error: "Something went wrong on our side. Please try again.",
};

const isSuccess = (state: FormState) => state === "joined" || state === "already_joined";

/** Email and button inside one 56px pill. */
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
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const dark = tone === "dark";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "submitting") return;
    if (!isValidEmail(email)) {
      setState("invalid");
      return;
    }

    setState("submitting");
    const company = new FormData(event.currentTarget).get("company");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company }),
      });
      const data = (await response.json()) as WaitlistResponse;
      setState(data.status in messages ? data.status : "error");
      if (isSuccess(data.status)) setEmail("");
    } catch {
      setState("error");
    }
  }

  const message = messages[state];
  const hasError = message !== undefined && !isSuccess(state);

  return (
    <form
      id={id}
      noValidate
      onSubmit={onSubmit}
      className={cn("relative mx-auto w-full max-w-[500px]", className)}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-5 sm:pl-6",
          "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3",
          dark
            ? "border-stage-line bg-stage-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] has-[input:focus-visible]:outline-stage-ink"
            : "border-hairline-strong bg-surface shadow-[0_1px_2px_rgba(11,11,12,0.04)] has-[input:focus-visible]:outline-ink",
        )}
      >
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
          onChange={(event) => {
            setEmail(event.target.value);
            if (hasError) setState("idle");
          }}
          aria-invalid={hasError || undefined}
          aria-describedby={statusId}
          className={cn(
            "h-full w-full min-w-0 flex-1 bg-transparent text-[16px] outline-none",
            dark ? "text-stage-ink placeholder:text-stage-muted" : "text-ink placeholder:text-muted",
          )}
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className={cn(
            "group relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] font-medium whitespace-nowrap transition-opacity duration-150 hover:opacity-90 disabled:opacity-60 sm:px-5",
            dark ? "bg-stage-ink text-ink" : "bg-ink text-bg",
          )}
        >
          {state === "submitting" ? "Joining…" : "Get early access"}
          <Arrow className="hidden sm:block" />
        </button>
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
          message ? (dark ? "text-stage-ink" : "text-ink") : dark ? "text-stage-muted" : "text-muted",
        )}
      >
        {!message && hint}
        {message && (
          <>
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                isSuccess(state) ? "bg-accent" : dark ? "bg-stage-ink" : "bg-ink",
              )}
            />
            {message}
          </>
        )}
      </p>
    </form>
  );
}
