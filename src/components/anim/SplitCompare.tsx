"use client";

import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { useSpan, type Clock } from "./clock";

export type CompareSide = { label: string; title: string; points: string[] };

type SplitCompareProps = {
  clock: Clock;
  left: CompareSide;
  right: CompareSide;
  /** ms */
  start?: number;
  className?: string;
};

/** Two sides slide in from opposite edges around a divider. */
export function SplitCompare({ clock, left, right, start = 0, className }: SplitCompareProps) {
  const divider = useSpan(clock, start, 500);
  return (
    <div className={cn("relative grid grid-cols-2", className)} aria-hidden="true">
      <Side clock={clock} side={left} start={start + 150} from={-12} />
      <m.span
        className="absolute inset-y-0 left-1/2 w-px bg-[var(--s-line)]"
        style={{ scaleY: divider, originY: 0 }}
      />
      <Side clock={clock} side={right} start={start + 300} from={12} accent />
    </div>
  );
}

function Side({
  clock,
  side,
  start,
  from,
  accent = false,
}: {
  clock: Clock;
  side: CompareSide;
  start: number;
  from: number;
  accent?: boolean;
}) {
  const progress = useSpan(clock, start, 600);
  const x = useTransform(progress, [0, 1], [from, 0]);
  const points = useSpan(clock, start + 300, 500);
  return (
    <m.div className="flex flex-col gap-[0.5em] px-[1em]" style={{ opacity: progress, x }}>
      <span className="flex items-center gap-[0.5em] font-mono text-[0.7em] uppercase tracking-[0.08em] text-[var(--s-muted)]">
        <span
          className={cn("size-[0.5em] rounded-full", accent ? "bg-accent" : "bg-[var(--s-track)]")}
        />
        {side.label}
      </span>
      <span className="text-[1.25em] font-medium tracking-[-0.02em] text-[var(--s-ink)]">
        {side.title}
      </span>
      <m.ul className="flex flex-col gap-[0.25em] text-[0.85em] text-[var(--s-muted)]" style={{ opacity: points }}>
        {side.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </m.ul>
    </m.div>
  );
}
