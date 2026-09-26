"use client";

import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { STAGGER } from "@/lib/motion";
import { useSpan, type Clock } from "./clock";

type WordRevealProps = {
  clock: Clock;
  text: string;
  /** ms */
  start?: number;
  serifWords?: string[];
  className?: string;
};

/** Reveals a line word by word, 60ms apart. */
export function WordReveal({ clock, text, start = 0, serifWords = [], className }: WordRevealProps) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, index) => (
        <Word
          key={`${word}-${index}`}
          clock={clock}
          start={start + index * STAGGER * 1000}
          serif={serifWords.includes(word)}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </Word>
      ))}
    </span>
  );
}

function Word({
  clock,
  start,
  serif,
  children,
}: {
  clock: Clock;
  start: number;
  serif: boolean;
  children: React.ReactNode;
}) {
  const progress = useSpan(clock, start, 600);
  const y = useTransform(progress, [0, 1], ["0.45em", "0em"]);
  return (
    <m.span
      className={cn("inline-block whitespace-pre", serif && "serif-accent")}
      style={{ opacity: progress, y }}
    >
      {children}
    </m.span>
  );
}
