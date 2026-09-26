"use client";

import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { useSpan, type Clock } from "./clock";

type TypeRevealProps = {
  clock: Clock;
  text: string;
  /** ms */
  start?: number;
  /** ms between characters */
  stagger?: number;
  /** Words set in Instrument Serif italic. */
  serifWords?: string[];
  className?: string;
};

/** A headline arrives character by character, each one rising into place. */
export function TypeReveal({
  clock,
  text,
  start = 0,
  stagger = 28,
  serifWords = [],
  className,
}: TypeRevealProps) {
  const words = text.split(" ");
  // Characters (and spaces) before each word, so the stagger runs across the whole line.
  const offsets = words.map((_, index) =>
    words.slice(0, index).reduce((sum, word) => sum + word.length + 1, 0),
  );
  return (
    <span className={className}>
      {words.map((word, wordIndex) => {
        const wordStart = start + offsets[wordIndex] * stagger;
        return (
          <span
            key={`${word}-${wordIndex}`}
            className={cn("inline-block whitespace-pre", serifWords.includes(word) && "serif-accent")}
          >
            {[...word].map((char, charIndex) => (
              <Char key={charIndex} clock={clock} start={wordStart + charIndex * stagger}>
                {char}
              </Char>
            ))}
            {wordIndex < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </span>
  );
}

function Char({ clock, start, children }: { clock: Clock; start: number; children: string }) {
  const progress = useSpan(clock, start, 420);
  const y = useTransform(progress, [0, 1], ["0.35em", "0em"]);
  return (
    <m.span className="inline-block" style={{ opacity: progress, y }}>
      {children}
    </m.span>
  );
}
