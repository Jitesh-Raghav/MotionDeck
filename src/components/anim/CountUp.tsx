"use client";

import { useSyncExternalStore } from "react";
import { m, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/cn";
import { useSpan, type Clock } from "./clock";

type CountUpProps = {
  clock: Clock;
  from: number;
  to: number;
  format: (value: number) => string;
  /** ms */
  start?: number;
  duration?: number;
  className?: string;
};

// false on the server and during hydration, true afterwards.
const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

const ROW = 1.15; // em per digit row

/**
 * An odometer. The server (and a page without JavaScript) shows the final
 * value, e.g. "$2.4M". After hydration the digits roll with the clock: the
 * last digit spins, and each higher digit turns over as the one below it
 * passes 9.
 *
 * The layout comes from the final string; `format` must be linear in the
 * value (currency, counts, percentages, multiples), which ours all are.
 */
export function CountUp({ clock, from, to, format, start = 0, duration = 1600, className }: CountUpProps) {
  const live = useHydrated();
  const progress = useSpan(clock, start, duration);
  const value = useTransform(progress, (p) => from + (to - from) * p);

  const final = format(to);
  const digitCount = final.replace(/\D/g, "").length;
  const finalNumber = Number(final.replace(/\D/g, "")) || 0;
  const factor = to === 0 ? 1 : finalNumber / to;
  const decimals = final.includes(".") ? final.split(".")[1].replace(/\D.*$/, "").length : 0;

  let place = digitCount;
  type Token = { kind: "digit"; digit: number; place: number } | { kind: "char"; char: string; place: number };
  const tokens: Token[] = [...final].map((char) =>
    /\d/.test(char) ? { kind: "digit", digit: Number(char), place: --place } : { kind: "char", char, place },
  );

  return (
    <span className={cn("tabular-nums", className)}>
      <span className="sr-only">{final}</span>
      <span aria-hidden="true" className="inline-flex leading-none">
        {tokens.map((token, index) =>
          token.kind === "digit" ? (
            <Digit
              key={index}
              value={value}
              factor={factor}
              place={token.place}
              decimals={decimals}
              final={token.digit}
              live={live}
            />
          ) : (
            <Separator
              key={index}
              char={token.char}
              value={value}
              factor={factor}
              place={token.place}
              decimals={decimals}
              live={live}
            />
          ),
        )}
      </span>
    </span>
  );
}

/**
 * Leading zeros stay in place, dimmed, like a mechanical odometer, and light
 * up as the number grows into them. Keeps the number anchored while it rolls.
 */
const shown = (n: number, place: number, decimals: number) =>
  place <= decimals ? 1 : 0.28 + 0.72 * Math.min(1, Math.max(0, (n - 10 ** place * 0.95) / (10 ** place * 0.05)));

function Digit({
  value,
  factor,
  place,
  decimals,
  final,
  live,
}: {
  value: MotionValue<number>;
  factor: number;
  place: number;
  decimals: number;
  final: number;
  live: boolean;
}) {
  const y = useTransform(value, (v) => {
    const n = Math.max(0, v * factor);
    let position: number;
    if (place === 0) position = n % 10;
    else {
      const below = (n / 10 ** (place - 1)) % 10;
      position = (Math.floor(n / 10 ** place) % 10) + Math.min(1, Math.max(0, below - 9));
    }
    return `${-position * ROW}em`;
  });
  const opacity = useTransform(value, (v) => shown(Math.max(0, v * factor), place, decimals));

  return (
    // An invisible copy of the final digit sets the width, so the column picks
    // up the surrounding font, tracking and tabular figures.
    <span className="relative inline-block overflow-hidden" style={{ height: `${ROW}em`, lineHeight: `${ROW}em` }}>
      <span className="invisible">{final}</span>
      <m.span
        className="absolute inset-x-0 top-0 flex flex-col"
        style={live ? { y, opacity } : { transform: `translateY(${-final * ROW}em)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit, index) => (
          <span key={index} className="block text-center" style={{ height: `${ROW}em`, lineHeight: `${ROW}em` }}>
            {digit}
          </span>
        ))}
      </m.span>
    </span>
  );
}

/** "$", ",", ".", "M", "%" … A comma hides along with the digit before it (which shares its place). */
function Separator({
  char,
  value,
  factor,
  place,
  decimals,
  live,
}: {
  char: string;
  value: MotionValue<number>;
  factor: number;
  place: number;
  decimals: number;
  live: boolean;
}) {
  const opacity = useTransform(value, (v) => (char === "," ? shown(Math.max(0, v * factor), place, decimals) : 1));
  return (
    <m.span
      className="inline-block whitespace-pre"
      style={{ height: `${ROW}em`, lineHeight: `${ROW}em`, ...(live ? { opacity } : {}) }}
    >
      {char}
    </m.span>
  );
}
