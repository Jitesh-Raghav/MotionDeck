"use client";

import { useTransform } from "motion/react";
import { useLoopClock, useNear, useOnScreen, type Clock } from "@/components/anim/clock";
import { DECKS, type SlideSpec } from "@/components/deck/decks";
import { SlideView } from "@/components/deck/SlideView";
import { SLIDE_MS } from "@/components/deck/timing";

// One slide from each kind across the example decks.
const REEL: SlideSpec[] = [
  DECKS[0].slides[1],
  DECKS[1].slides[1],
  DECKS[3].slides[1],
  DECKS[0].slides[3],
  DECKS[2].slides[3],
  DECKS[1].slides[3],
  DECKS[0].slides[2],
  DECKS[3].slides[3],
];

/**
 * An endless, slightly tilted strip of mini slides, each playing its
 * animation. The strip pauses on hover; its ends fade out under a mask.
 */
export function SlideReel() {
  const { ref, onScreen } = useOnScreen<HTMLDivElement>(0.1);
  const clock = useLoopClock(SLIDE_MS, onScreen, SLIDE_MS - 500);
  const { ref: nearRef, near } = useNear<HTMLElement>();

  return (
    <section ref={nearRef} aria-label="Slides made with Motiondeck" className="relative overflow-hidden pt-14 pb-28 md:pt-16 md:pb-32">
      <p className="sr-only">
        A moving strip of example slides: count-ups, charts, timelines and feature cards.
      </p>
      <div
        ref={ref}
        aria-hidden="true"
        className="reel -mx-[5%] -rotate-[3deg] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      >
        <div className="reel-track flex w-max gap-5">
          {[...REEL, ...REEL].map((slide, index) => (
            <MiniSlide key={index} slide={slide} clock={clock} offset={(index % REEL.length) * 470} show={near} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniSlide({ slide, clock, offset, show }: { slide: SlideSpec; clock: Clock; offset: number; show: boolean }) {
  // Each slide runs the shared clock at its own offset, so they never sync up.
  const local = useTransform(clock, (time) => (time + offset) % SLIDE_MS);
  return (
    <div className="slide-dark relative aspect-video w-[300px] shrink-0 overflow-hidden rounded-2xl bg-stage shadow-[0_20px_40px_-24px_rgba(11,11,12,0.45)] ring-1 ring-black/10 md:w-[360px]">
      {show && <SlideView slide={slide} clock={local} start={0} scene={false} />}
    </div>
  );
}
