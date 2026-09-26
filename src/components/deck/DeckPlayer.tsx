"use client";

import { useState } from "react";
import { m, useMotionValueEvent, useTransform } from "motion/react";
import type { Clock } from "@/components/anim/clock";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { Deck } from "./decks";
import { SlideView } from "./SlideView";
import { SLIDE_MS } from "./timing";

export { SLIDE_MS };

const FADE_IN = 480;
const FADE_OUT = 340;

export const deckDuration = (deck: Deck) => deck.slides.length * SLIDE_MS;

/** When slide `index` starts, for a deck that begins at `offset` ms. */
export const slideStart = (index: number, offset = 0) => offset + index * SLIDE_MS;

/** A moment where the slide is fully built and not yet fading out. */
export const slideSettled = (index: number, offset = 0) => slideStart(index + 1, offset) - FADE_OUT - 80;

/** Cuts between slides vary like an edit: rise, push, zoom. */
const TRANSITIONS = ["rise", "push", "zoom"] as const;
type Transition = (typeof TRANSITIONS)[number];

/** Plays a deck's slides back to back on `clock`, starting at `offset` ms. */
export function DeckPlayer({
  deck,
  clock,
  offset = 0,
  className,
}: {
  deck: Deck;
  clock: Clock;
  offset?: number;
  className?: string;
}) {
  const last = deck.slides.length - 1;
  const indexAt = (time: number) => Math.min(last, Math.max(0, Math.floor((time - offset) / SLIDE_MS)));
  const [active, setActive] = useState(() => indexAt(clock.get()));
  useMotionValueEvent(clock, "change", (time) => setActive(indexAt(time)));

  // Only the current slide and its neighbours are mounted, so off-screen
  // slides cost nothing per frame. The first slide stays ready for loops.
  const mounted = (index: number) => Math.abs(index - active) <= 1 || (index === 0 && active === last);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {deck.slides.map(
        (slide, index) =>
          mounted(index) && (
            <SlideFrame
              key={`${deck.id}-${index}`}
              clock={clock}
              start={slideStart(index, offset)}
              end={slideStart(index + 1, offset)}
              transition={index === 0 ? "rise" : TRANSITIONS[index % TRANSITIONS.length]}
            >
              <SlideView slide={slide} clock={clock} start={slideStart(index, offset)} />
            </SlideFrame>
          ),
      )}
    </div>
  );
}

function SlideFrame({
  clock,
  start,
  end,
  transition,
  children,
}: {
  clock: Clock;
  start: number;
  end: number;
  transition: Transition;
  children: React.ReactNode;
}) {
  const enter = [start, start + FADE_IN];
  const opacity = useTransform(clock, [start, start + FADE_IN * 0.7, end - FADE_OUT, end], [0, 1, 1, 0]);
  const x = useTransform(clock, enter, transition === "push" ? ["6%", "0%"] : ["0%", "0%"], { ease });
  const y = useTransform(clock, enter, transition === "rise" ? [12, 0] : [0, 0], { ease });
  // Zoom cuts land from slightly large; every slide then drifts in slowly (Ken Burns).
  const scale = useTransform(
    clock,
    [start, start + FADE_IN, end - FADE_OUT, end],
    [transition === "zoom" ? 1.08 : 1, 1, 1.025, 1.035],
  );
  return (
    <m.div className="absolute inset-0" style={{ opacity, x, y, scale }}>
      {children}
    </m.div>
  );
}
