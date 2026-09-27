"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  m,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import type { Clock } from "@/components/anim/clock";
import { DECKS, type Deck } from "@/components/deck/decks";
import { DeckPlayer, SLIDE_MS, deckDuration, slideSettled } from "@/components/deck/DeckPlayer";
import { SlideStill } from "@/components/deck/SlideView";
import { Container } from "@/components/ui/layout";
import { LogoMark } from "@/components/ui/Wordmark";
import { PixelLandscape } from "./PixelLandscape";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";

/* Hero schedule, per deck: type the prompt, "generate", then play the slides. */
const TYPE_START = 350;
const CHAR_MS = 38;

function timingFor(deck: Deck) {
  const typed = TYPE_START + deck.prompt.length * CHAR_MS;
  const press = typed + 250;
  const slidesAt = press + 700;
  return {
    typed,
    press,
    slidesAt,
    total: slidesAt + deckDuration(deck) + 300,
    /** Reduced motion: prompt typed, first slide fully built. */
    settled: slidesAt + slideSettled(0),
  };
}

type Timing = ReturnType<typeof timingFor>;

const MAX_STEP = 250;

// The thumbnail rail only shows from md up; don't build it on phones or on the server.
const WIDE = "(min-width: 768px)";
const subscribeWide = (onChange: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const useWideScreen = () =>
  useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);

/**
 * The hero stage: the pixel landscape with the copy over its sky, the example
 * chips over the hills, and the product window rising from behind them.
 */
export function HeroStage({ copy }: { copy: React.ReactNode }) {
  const [deckIndex, setDeckIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // The demo starts on the visitor's first scroll, pointer move, touch or key
  // (the window rises into view with scrolling), or after five seconds. It
  // never competes with the first load.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const events = ["scroll", "pointermove", "touchstart", "keydown"] as const;
    const start = () => {
      setReady(true);
      cleanup();
    };
    const timer = window.setTimeout(start, 5000);
    const cleanup = () => {
      window.clearTimeout(timer);
      for (const name of events) window.removeEventListener(name, start);
    };
    for (const name of events) window.addEventListener(name, start, { passive: true, once: true });
    return cleanup;
  }, []);
  const deck = DECKS[deckIndex];
  const timing = useMemo(() => timingFor(deck), [deck]);
  const reduce = useReducedMotion();

  const windowRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(windowRef, { amount: 0.1 });
  const clock = useMotionValue(0);
  const switching = useRef(false);

  // New deck: start over from an empty prompt (or its final frame).
  useEffect(() => {
    clock.set(reduce ? timing.settled : 0);
    switching.current = false;
  }, [clock, deckIndex, reduce, timing]);

  useAnimationFrame((_, delta) => {
    if (!ready || reduce || paused || !onScreen || switching.current) return;
    const next = clock.get() + Math.min(delta, MAX_STEP);
    if (next >= timing.total) {
      // Loop through the examples.
      switching.current = true;
      setDeckIndex((index) => (index + 1) % DECKS.length);
      return;
    }
    clock.set(next);
  });

  function choose(index: number) {
    setPaused(false);
    if (index === deckIndex) clock.set(reduce ? timing.settled : 0);
    else setDeckIndex(index);
  }

  return (
    <>
      <section
        id="top"
        aria-labelledby="hero-title"
        className="relative isolate flex min-h-[92svh] flex-col overflow-hidden"
      >
        <PixelLandscape />
        <Container className="flex flex-col items-center pt-28 text-center md:pt-36">{copy}</Container>
        {/* Chips sit over the hills; the window covers the band below them as it rises. */}
        <Container className="mt-auto flex justify-center pt-16 pb-[150px] md:pb-[160px]">
          <div
            className="rise-in flex flex-wrap items-center justify-center gap-2"
            style={{ "--delay": "880ms" } as React.CSSProperties}
          >
            <span className="rounded-full bg-surface/85 px-3.5 py-1.5 text-[15px] text-muted backdrop-blur-sm max-sm:w-full max-sm:bg-transparent max-sm:backdrop-blur-none sm:mr-1">
              Try an example:
            </span>
        {DECKS.map((example, index) => (
          <button
            key={example.id}
            type="button"
            aria-pressed={index === deckIndex}
            onClick={() => choose(index)}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[15px] transition-colors duration-150",
                index === deckIndex
                  ? "border-ink bg-ink text-bg"
                  : "border-hairline-strong bg-surface/90 text-ink backdrop-blur-sm hover:bg-surface",
              )}
            >
              {index === deckIndex && <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />}
              {example.chip}
            </button>
          ))}
          </div>
        </Container>
      </section>

      <Container className="relative z-10 -mt-[120px] flex justify-center overflow-x-clip">
        <ProductWindow
          windowRef={windowRef}
          deck={deck}
          clock={clock}
          timing={timing}
          paused={paused}
          onTogglePause={() => setPaused((value) => !value)}
        />
      </Container>
    </>
  );
}

function ProductWindow({
  windowRef,
  deck,
  clock,
  timing,
  paused,
  onTogglePause,
}: {
  windowRef: React.RefObject<HTMLDivElement | null>;
  deck: Deck;
  clock: Clock;
  timing: Timing;
  paused: boolean;
  onTogglePause: () => void;
}) {
  // Rises from behind the hills: starts low, tilted back and small, then
  // lifts, stands up and settles as the page scrolls.
  const { scrollYProgress } = useScroll({ target: windowRef, offset: ["start end", "start 0.35"] });
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  const wide = useWideScreen();
  const [active, setActive] = useState(-1);
  useMotionValueEvent(clock, "change", (time) => {
    const index = time < timing.slidesAt ? -1 : Math.floor((time - timing.slidesAt) / SLIDE_MS);
    setActive(Math.min(index, deck.slides.length - 1));
  });

  return (
    <div ref={windowRef} className="relative w-full max-w-[1120px] [perspective:1800px]">
      {/* Ember spotlight behind the window. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[8%] left-1/2 h-[95%] w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,90,31,0.22),rgba(255,90,31,0.06)_50%,transparent)] blur-2xl"
      />
      <m.figure
        // Reduced motion flattens the tilt in CSS, so server and client HTML match.
        className="on-dark slide-dark relative overflow-hidden rounded-window bg-stage-2 text-left shadow-window ring-1 ring-white/[0.07] motion-reduce:transform-none!"
        style={{ y, rotateX, scale, transformOrigin: "50% 0%" }}
      >
        <figcaption className="sr-only">
          Example: the Motiondeck editor turns the prompt “{deck.prompt}” into a {deck.slides.length}-slide
          animated deck. These examples are pre-scripted.
        </figcaption>

        {/* Title bar */}
        <div aria-hidden="true" className="flex h-12 items-center justify-between gap-4 border-b border-stage-line px-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden items-center gap-1.5 sm:flex">
              {[0, 1, 2].map((dot) => (
                <span key={dot} className="size-2.5 rounded-full bg-white/[0.12]" />
              ))}
            </span>
            <LogoMark className="size-4 text-stage-ink sm:ml-2" />
            <span className="truncate text-[14px] text-stage-ink">{deck.title}</span>
            <span className="hidden shrink-0 font-mono text-[12px] text-stage-muted sm:inline">
              {deck.slides.length} slides
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden h-8 items-center rounded-full border border-stage-line px-3.5 text-[13px] text-stage-muted sm:inline-flex">
              Share
            </span>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stage-ink px-3.5 text-[13px] font-medium text-ink">
              <svg viewBox="0 0 12 12" className="size-2.5 fill-current" aria-hidden="true">
                <path d="M3 1.5v9l7.5-4.5z" />
              </svg>
              Present
            </span>
          </div>
        </div>

        <div className="flex">
          {/* Thumbnail rail: hidden on small screens. */}
          <div aria-hidden="true" className="hidden w-[168px] shrink-0 flex-col gap-3 border-r border-stage-line p-3.5 md:flex">
            {wide &&
              deck.slides.map((slide, index) => (
                <Thumbnail
                  key={`${deck.id}-${index}`}
                  clock={clock}
                  appearAt={timing.slidesAt - 500 + index * 110}
                  index={index}
                  active={index === active}
                >
                  <SlideStill slide={slide} />
                </Thumbnail>
              ))}
          </div>

          <div className="min-w-0 flex-1 p-3 sm:p-4">
            <PromptBar deck={deck} clock={clock} timing={timing} />
            <div className="relative mt-3 aspect-video overflow-hidden rounded-[14px] bg-stage ring-1 ring-stage-line">
              <CanvasIntro clock={clock} timing={timing} />
              <DeckPlayer deck={deck} clock={clock} offset={timing.slidesAt} />
            </div>
            <PlaybackBar
              deck={deck}
              clock={clock}
              timing={timing}
              paused={paused}
              onTogglePause={onTogglePause}
            />
          </div>
        </div>
      </m.figure>
    </div>
  );
}

function Thumbnail({
  clock,
  appearAt,
  index,
  active,
  children,
}: {
  clock: Clock;
  appearAt: number;
  index: number;
  active: boolean;
  children: React.ReactNode;
}) {
  const opacity = useTransform(clock, [appearAt, appearAt + 300], [0, 1]);
  const y = useTransform(clock, [appearAt, appearAt + 300], [6, 0]);
  return (
    <m.div className="flex items-start gap-2" style={{ opacity, y }}>
      <span className="w-3 pt-0.5 font-mono text-[11px] text-stage-muted">{index + 1}</span>
      <div
        className={cn(
          "relative h-[67.5px] w-[120px] shrink-0 overflow-hidden rounded-[6px] bg-stage ring-1 transition-shadow duration-300",
          active ? "ring-2 ring-accent" : "ring-stage-line",
        )}
      >
        {/*
          A true miniature: the slide lays out at 640×360, where its type and
          graphics have room, then scales down to fit (120 / 640 = 0.1875).
        */}
        <div className="absolute top-0 left-0 h-[360px] w-[640px] origin-top-left scale-[0.1875]">{children}</div>
      </div>
    </m.div>
  );
}

function PromptBar({ deck, clock, timing }: { deck: Deck; clock: Clock; timing: Timing }) {
  const typed = useTransform(clock, (time) => {
    const chars = Math.floor((time - TYPE_START) / CHAR_MS);
    return deck.prompt.slice(0, Math.max(0, Math.min(deck.prompt.length, chars)));
  });
  const caret = useTransform(clock, (time) =>
    time < timing.typed || Math.floor(time / 450) % 2 === 0 ? 1 : 0,
  );
  const press = useTransform(clock, [timing.press, timing.press + 90, timing.press + 260], [1, 0.94, 1]);
  const idle = useTransform(clock, [timing.press + 200, timing.press + 400], [1, 0]);
  const done = useTransform(clock, [timing.press + 200, timing.press + 400], [0, 1]);

  return (
    <div
      aria-hidden="true"
      className="flex h-11 items-center gap-3 rounded-full border border-stage-line bg-stage py-1 pr-1 pl-4"
    >
      <svg viewBox="0 0 16 16" className="size-4 shrink-0 fill-accent" aria-hidden="true">
        <path d="M8 1l1.6 4.4L14 7l-4.4 1.6L8 13l-1.6-4.4L2 7l4.4-1.6z" />
      </svg>
      <span className="min-w-0 flex-1 truncate text-[14px] text-stage-ink sm:text-[15px]">
        <m.span>{typed}</m.span>
        <m.span
          className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[0.18em] bg-accent"
          style={{ opacity: caret }}
        />
      </span>
      <m.span
        className="relative grid h-9 shrink-0 place-items-center rounded-full bg-stage-ink px-4 text-[13px] font-medium text-ink"
        style={{ scale: press }}
      >
        <m.span className="col-start-1 row-start-1" style={{ opacity: idle }}>
          Generate
        </m.span>
        <m.span className="col-start-1 row-start-1 font-mono text-[12px]" style={{ opacity: done }}>
          {deck.slides.length} slides
        </m.span>
        <Cursor clock={clock} timing={timing} />
      </m.span>
    </div>
  );
}

/** A pointer glides up from the canvas and clicks Generate. */
function Cursor({ clock, timing }: { clock: Clock; timing: Timing }) {
  const travel = [timing.typed - 900, timing.press - 60];
  const x = useTransform(clock, travel, [-240, 6], { ease });
  const y = useTransform(clock, travel, [170, 8], { ease });
  const opacity = useTransform(
    clock,
    [timing.typed - 1000, timing.typed - 800, timing.slidesAt, timing.slidesAt + 300],
    [0, 1, 1, 0],
  );
  const tap = useTransform(clock, [timing.press - 40, timing.press + 60, timing.press + 220], [1, 0.82, 1]);
  const ripple = useTransform(clock, [timing.press, timing.press + 500], [0.3, 1.9]);
  const rippleOpacity = useTransform(clock, [timing.press, timing.press + 500], [0.7, 0]);
  return (
    <>
      <m.span
        className="pointer-events-none absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent"
        style={{ scale: ripple, opacity: rippleOpacity }}
      />
      <m.span className="pointer-events-none absolute top-1/2 left-1/2 z-10" style={{ x, y, opacity }}>
        <m.svg viewBox="0 0 18 20" className="h-5 w-[18px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)]" style={{ scale: tap, originX: 0, originY: 0 }}>
          <path d="M1.5 1.5l12.5 7.2-5.6 1.4-2.4 5.9z" fill="#fff" stroke="#0b0b0c" strokeWidth="1.2" strokeLinejoin="round" />
        </m.svg>
      </m.span>
    </>
  );
}

/** What the canvas shows before the first slide: an empty stage, then a build bar. */
function CanvasIntro({ clock, timing }: { clock: Clock; timing: Timing }) {
  const opacity = useTransform(clock, [0, timing.slidesAt - 200, timing.slidesAt], [1, 1, 0]);
  const building = useTransform(clock, [timing.press, timing.press + 200], [0, 1]);
  const bar = useTransform(clock, [timing.press, timing.slidesAt], [0, 1]);
  return (
    <m.div aria-hidden="true" className="absolute inset-0 grid place-items-center" style={{ opacity }}>
      <div className="absolute inset-[6%] rounded-[10px] border border-dashed border-white/[0.08]" />
      <m.div className="flex w-[34%] flex-col items-center gap-3" style={{ opacity: building }}>
        <span className="font-mono text-[12px] tracking-[0.1em] text-stage-muted uppercase">Building slides</span>
        <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
          <m.span className="absolute inset-0 origin-left bg-accent" style={{ scaleX: bar }} />
        </span>
      </m.div>
    </m.div>
  );
}

const clockTime = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

function PlaybackBar({
  deck,
  clock,
  timing,
  paused,
  onTogglePause,
}: {
  deck: Deck;
  clock: Clock;
  timing: Timing;
  paused: boolean;
  onTogglePause: () => void;
}) {
  const length = deckDuration(deck);
  const progress = useTransform(clock, [timing.slidesAt, timing.slidesAt + length], [0, 1]);
  const playhead = useTransform(progress, (p) => `${p * 100}%`);
  const elapsed = useTransform(clock, (time) => clockTime(time - timing.slidesAt));

  return (
    <div className="mt-3 flex items-center gap-3 px-1">
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? "Play demo" : "Pause demo"}
        className="grid size-8 shrink-0 place-items-center rounded-full text-stage-ink transition-opacity duration-150 hover:opacity-80 motion-reduce:hidden"
      >
        <svg viewBox="0 0 12 12" className="size-3 fill-current" aria-hidden="true">
          {paused ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />}
        </svg>
      </button>
      <m.span aria-hidden="true" className="w-9 font-mono text-[12px] text-stage-muted">
        {elapsed}
      </m.span>
      <div aria-hidden="true" className="relative h-[3px] flex-1 rounded-full bg-white/10">
        <m.span className="absolute inset-0 origin-left rounded-full bg-stage-ink/70" style={{ scaleX: progress }} />
        {deck.slides.slice(1).map((_, index) => (
          <span
            key={index}
            className="absolute top-0 h-full w-[3px] -translate-x-1/2 bg-stage-2"
            style={{ left: `${((index + 1) / deck.slides.length) * 100}%` }}
          />
        ))}
        <m.span className="absolute inset-0" style={{ x: playhead }}>
          <span className="absolute top-1/2 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(255,90,31,0.25)]" />
        </m.span>
      </div>
      <span aria-hidden="true" className="w-9 text-right font-mono text-[12px] text-stage-muted">
        {clockTime(length)}
      </span>
    </div>
  );
}
