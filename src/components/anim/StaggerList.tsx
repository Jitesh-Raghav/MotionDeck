"use client";

import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { useSpan, type Clock } from "./clock";

type StaggerListProps = {
  clock: Clock;
  items: string[];
  /** ms */
  start?: number;
  stagger?: number;
  className?: string;
};

/** Points arrive one by one. */
export function StaggerList({ clock, items, start = 0, stagger = 140, className }: StaggerListProps) {
  return (
    <ul className={cn("flex flex-col", className)} aria-hidden="true">
      {items.map((item, index) => (
        <Item key={item} clock={clock} start={start + index * stagger} index={index}>
          {item}
        </Item>
      ))}
    </ul>
  );
}

function Item({
  clock,
  start,
  index,
  children,
}: {
  clock: Clock;
  start: number;
  index: number;
  children: React.ReactNode;
}) {
  const progress = useSpan(clock, start, 550);
  const x = useTransform(progress, [0, 1], [-10, 0]);
  return (
    <m.li
      className="flex items-center gap-[0.75em] border-b border-[var(--s-line)] py-[0.6em] last:border-b-0"
      style={{ opacity: progress, x }}
    >
      <span className="w-[1.6em] shrink-0 font-mono text-[0.75em] text-[var(--s-muted)] tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-[var(--s-ink)]">{children}</span>
    </m.li>
  );
}
