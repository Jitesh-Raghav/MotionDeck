"use client";

import { m, useTransform } from "motion/react";
import { useLoopClock, useNear, useOnScreen, type Clock } from "@/components/anim/clock";
import { DECKS } from "@/components/deck/decks";
import { DeckPlayer, deckDuration, slideSettled } from "@/components/deck/DeckPlayer";
import { cn } from "@/lib/cn";

const DECK = DECKS[1]; // Q4 results
const LOOP = deckDuration(DECK);

/** The same deck, in sync, at 16:9, 9:16 and 1:1. */
export function FormatFrames() {
  const { ref, onScreen } = useOnScreen<HTMLDivElement>(0.2);
  const { ref: nearRef, near } = useNear<HTMLDivElement>();
  // One element serves both observers.
  const setRef = (element: HTMLDivElement | null) => {
    ref.current = element;
    nearRef.current = element;
  };
  const clock = useLoopClock(LOOP, onScreen, slideSettled(1));

  return (
    <div
      ref={setRef}
      role="img"
      aria-label="The same Q4 results deck playing at three sizes: 16:9 for YouTube, 9:16 for Reels and Shorts, and 1:1 for LinkedIn."
      className="mt-12 grid grid-cols-2 items-center gap-x-4 gap-y-10 lg:grid-cols-[1.9fr_0.72fr_1.12fr] lg:gap-8"
    >
      <Frame label="YouTube" ratio="16:9" className="col-span-2 lg:col-span-1">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-stage shadow-window ring-1 ring-black/5">
          {near && <DeckPlayer deck={DECK} clock={clock} />}
          <VideoProgress clock={clock} />
        </div>
      </Frame>

      <Frame label="Reels & Shorts" ratio="9:16" className="justify-self-center lg:justify-self-auto">
        {/* Minimal phone outline */}
        <div className="mx-auto w-full max-w-[230px] rounded-[34px] bg-stage p-[7px] shadow-window ring-1 ring-black/10">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[28px] bg-stage ring-1 ring-white/[0.06]">
            {/* Content starts below the status bar and notch. */}
            <div className="absolute inset-x-0 top-7 bottom-0">
              {near && <DeckPlayer deck={DECK} clock={clock} />}
            </div>
            <span className="absolute top-2.5 left-1/2 h-[18px] w-[64px] -translate-x-1/2 rounded-full bg-black" />
          </div>
        </div>
      </Frame>

      <Frame label="LinkedIn" ratio="1:1">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-stage shadow-window ring-1 ring-black/5">
          {near && <DeckPlayer deck={DECK} clock={clock} />}
        </div>
      </Frame>
    </div>
  );
}

function Frame({
  label,
  ratio,
  className,
  children,
}: {
  label: string;
  ratio: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className={cn("slide-dark flex w-full flex-col", className)}>
      {children}
      <figcaption className="mt-5 flex items-center justify-center gap-2 text-[15px] text-ink">
        {label}
        <span className="font-mono text-[12px] tracking-[0.1em] text-muted">{ratio}</span>
      </figcaption>
    </figure>
  );
}

/** A thin video scrubber along the bottom of the 16:9 frame. */
function VideoProgress({ clock }: { clock: Clock }) {
  const scaleX = useTransform(clock, [0, LOOP], [0, 1]);
  return (
    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
      <m.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX }} />
    </div>
  );
}
