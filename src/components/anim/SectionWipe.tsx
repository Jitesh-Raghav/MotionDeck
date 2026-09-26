"use client";

import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { useSpan, type Clock } from "./clock";

type Chapter = { number: string; title: string };

type SectionWipeProps = {
  clock: Clock;
  from: Chapter;
  to: Chapter;
  /** ms when the wipe starts */
  start?: number;
  className?: string;
};

/** One chapter card slides away as the next one sweeps in behind an accent edge. */
export function SectionWipe({ clock, from, to, start = 0, className }: SectionWipeProps) {
  const wipe = useSpan(clock, start, 800);
  const outgoing = useTransform(wipe, [0, 1], ["0%", "-30%"]);
  const outgoingOpacity = useTransform(wipe, [0, 0.8], [1, 0]);
  const incoming = useTransform(wipe, [0, 1], ["100%", "0%"]);
  const content = useSpan(clock, start + 500, 600);
  const contentY = useTransform(content, [0, 1], [10, 0]);

  return (
    <div className={cn("relative overflow-hidden", className)} aria-hidden="true">
      <m.div className="absolute inset-0 flex flex-col justify-end p-[8%]" style={{ x: outgoing, opacity: outgoingOpacity }}>
        <ChapterText chapter={from} />
      </m.div>
      <m.div
        className="absolute inset-0 flex flex-col justify-end border-l-2 border-accent bg-[var(--s-bg)] p-[8%]"
        style={{ x: incoming }}
      >
        <m.div className="flex flex-col" style={{ opacity: content, y: contentY }}>
          <ChapterText chapter={to} />
        </m.div>
      </m.div>
    </div>
  );
}

function ChapterText({ chapter }: { chapter: Chapter }) {
  return (
    <>
      <span className="font-mono text-[13px] tracking-[0.1em] text-[var(--s-muted)] uppercase">
        Chapter {chapter.number}
      </span>
      <span className="mt-2 text-[28px] leading-tight font-medium tracking-[-0.03em] text-[var(--s-ink)]">
        {chapter.title}
      </span>
    </>
  );
}
