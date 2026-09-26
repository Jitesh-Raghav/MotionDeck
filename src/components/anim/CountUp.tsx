"use client";

import { m, useTransform } from "motion/react";
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

/** Counts from one number to another. Tabular figures keep the width steady. */
export function CountUp({
  clock,
  from,
  to,
  format,
  start = 0,
  duration = 1600,
  className,
}: CountUpProps) {
  const progress = useSpan(clock, start, duration);
  const text = useTransform(progress, (p) => format(Math.round(from + (to - from) * p)));
  return <m.span className={cn("tabular-nums", className)}>{text}</m.span>;
}
