"use client";

import { useState } from "react";
import { m, useTransform } from "motion/react";
import { useLoopClock, useLoopFade, useSpan, type Clock } from "@/components/anim/clock";
import { DECKS } from "@/components/deck/decks";
import { DeckPlayer } from "@/components/deck/DeckPlayer";
import { cn } from "@/lib/cn";

/*
 * The three product moments behind "How it works". Each scene runs its own
 * looping clock and only plays while it's the one being shown.
 */

type SceneProps = { playing: boolean; className?: string };

/* 1. Describe: the prompt types itself, then a format and theme get picked. */

const PROMPT = "Explain how compound interest works for first-time investors.";
const DESCRIBE_LOOP = 6400;
const TYPE_START = 300;
const CHAR_MS = 32;
const TYPED = TYPE_START + PROMPT.length * CHAR_MS;

const FORMATS = ["YouTube explainer", "Course lesson", "Pitch deck", "Webinar"];
const THEMES = [
  { name: "Paper", swatch: "bg-[#FAFAF7]" },
  { name: "Ink", swatch: "bg-[#0B0B0C] ring-1 ring-white/20" },
  { name: "Ember", swatch: "bg-[#0B0B0C] ring-1 ring-white/20 after:absolute after:inset-x-1.5 after:bottom-1.5 after:h-1 after:rounded-full after:bg-accent" },
];

export function DescribeScene({ playing, className }: SceneProps) {
  const clock = useLoopClock(DESCRIBE_LOOP, playing);
  const fade = useLoopFade(clock, DESCRIBE_LOOP);
  const typed = useTransform(clock, (time) =>
    PROMPT.slice(0, Math.max(0, Math.min(PROMPT.length, Math.floor((time - TYPE_START) / CHAR_MS)))),
  );
  const caret = useTransform(clock, (time) => (time < TYPED || Math.floor(time / 450) % 2 === 0 ? 1 : 0));
  const pickFormat = useSpan(clock, TYPED + 300, 300);
  const pickTheme = useSpan(clock, TYPED + 800, 300);
  const press = useTransform(clock, [TYPED + 1500, TYPED + 1600, TYPED + 1800], [1, 0.95, 1]);

  return (
    <m.div className={cn("flex flex-col gap-5", className)} style={{ opacity: fade }}>
      <SceneLabel>New deck</SceneLabel>
      <div className="min-h-[104px] rounded-2xl border border-stage-line bg-stage p-4 text-[15px] leading-relaxed text-stage-ink">
        <m.span>{typed}</m.span>
        <m.span
          className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-accent"
          style={{ opacity: caret }}
        />
      </div>
      <div>
        <SceneLabel>Format</SceneLabel>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {FORMATS.map((format, index) => (
            <span
              key={format}
              className="relative inline-flex h-8 items-center gap-1.5 rounded-full border border-stage-line px-3 text-[13px] whitespace-nowrap text-stage-muted"
            >
              {/* The picked chip: ring, tint and dot fade in; its size never changes. */}
              {index === 0 && (
                <>
                  <m.span
                    className="absolute -inset-px rounded-full border border-stage-ink/60 bg-stage-ink/10"
                    style={{ opacity: pickFormat }}
                  />
                  <m.span className="relative size-1.5 rounded-full bg-accent" style={{ opacity: pickFormat }} />
                </>
              )}
              <span className="relative">{format}</span>
            </span>
          ))}
        </div>
      </div>
      <div>
        <SceneLabel>Theme</SceneLabel>
        <div className="mt-2.5 flex gap-3">
          {THEMES.map((theme, index) => (
            <span key={theme.name} className="flex flex-col items-center gap-1.5">
              <span className="relative block">
                <span className={cn("relative block h-10 w-14 rounded-lg", theme.swatch)} />
                {index === 2 && (
                  <m.span
                    className="absolute -inset-1 rounded-[11px] ring-2 ring-accent"
                    style={{ opacity: pickTheme }}
                  />
                )}
              </span>
              <span className="text-[12px] text-stage-muted">{theme.name}</span>
            </span>
          ))}
        </div>
      </div>
      <m.span
        className="mt-1 inline-flex h-10 w-fit items-center rounded-full bg-stage-ink px-5 text-[14px] font-medium text-ink"
        style={{ scale: press }}
      >
        Generate outline
      </m.span>
    </m.div>
  );
}

/* 2. Refine: one outline row lifts and moves up a place. */

const OUTLINE = [
  { title: "How compound interest works", tag: "Title" },
  { title: "What $10,000 becomes", tag: "Stat" },
  { title: "Growth by decade", tag: "Bars" },
  { title: "The long game", tag: "Timeline" },
  { title: "Start early", tag: "List" },
];
const REFINE_LOOP = 5600;
const ROW = 56; // row height + gap, px
const MOVE_AT = 1300;

export function RefineScene({ playing, className }: SceneProps) {
  const clock = useLoopClock(REFINE_LOOP, playing);
  const fade = useLoopFade(clock, REFINE_LOOP);
  return (
    <m.div className={cn("flex flex-col gap-4", className)} style={{ opacity: fade }}>
      <div className="flex items-center justify-between">
        <SceneLabel>Outline · 5 slides</SceneLabel>
        <span className="font-mono text-[12px] text-stage-muted">Drag to reorder</span>
      </div>
      <div className="relative flex gap-3">
        {/* Slide numbers stay put; the rows move. */}
        <div className="flex flex-col gap-2 pt-[15px]">
          {OUTLINE.map((_, index) => (
            <span key={index} className="h-12 font-mono text-[12px] text-stage-muted">
              {String(index + 1).padStart(2, "0")}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {OUTLINE.map((row, index) => (
            <OutlineRow key={row.title} clock={clock} row={row} shift={index === 3 ? -1 : index === 2 ? 1 : 0} />
          ))}
        </div>
      </div>
      <span className="mt-1 inline-flex h-10 w-fit items-center rounded-full bg-stage-ink px-5 text-[14px] font-medium text-ink">
        Generate deck
      </span>
    </m.div>
  );
}

function OutlineRow({ clock, row, shift }: { clock: Clock; row: (typeof OUTLINE)[number]; shift: number }) {
  const moving = shift === -1;
  const y = useTransform(clock, [MOVE_AT, MOVE_AT + 700], [0, shift * ROW]);
  const lift = useTransform(clock, [MOVE_AT - 250, MOVE_AT, MOVE_AT + 700, MOVE_AT + 950], [1, 1.025, 1.025, 1]);
  const ring = useTransform(clock, [MOVE_AT - 250, MOVE_AT, MOVE_AT + 700, MOVE_AT + 950], [0, 1, 1, 0]);
  return (
    <m.div
      className={cn(
        "relative flex h-12 items-center gap-3 rounded-xl border border-stage-line bg-stage px-3.5",
        moving && "z-10",
      )}
      style={{ y, scale: moving ? lift : 1 }}
    >
      {moving && (
        <m.span className="absolute -inset-px rounded-xl ring-2 ring-accent/70" style={{ opacity: ring }} />
      )}
      <svg viewBox="0 0 10 16" className="h-4 w-2.5 shrink-0 fill-stage-muted/60" aria-hidden="true">
        {[2, 8, 14].flatMap((cy) => [
          <circle key={`a${cy}`} cx="2.5" cy={cy} r="1.3" />,
          <circle key={`b${cy}`} cx="7.5" cy={cy} r="1.3" />,
        ])}
      </svg>
      <span className="min-w-0 flex-1 truncate text-[14px] text-stage-ink">{row.title}</span>
      <span className="shrink-0 rounded-full border border-stage-line px-2 py-0.5 font-mono text-[11px] text-stage-muted uppercase">
        {row.tag}
      </span>
    </m.div>
  );
}

/* 3. Present or export: the deck plays, then an MP4 export runs to 100%. */

const EXPORT_LOOP = 10_000;
const MODAL_AT = 4300;
const RENDER_START = MODAL_AT + 400;
const RENDER_END = RENDER_START + 2000;

export function ExportScene({ playing, className }: SceneProps) {
  // Mount the deck the first time this scene plays; it stays mounted after.
  const [started, setStarted] = useState(false);
  if (playing && !started) setStarted(true);
  const clock = useLoopClock(EXPORT_LOOP, playing, RENDER_END + 900);
  const fade = useLoopFade(clock, EXPORT_LOOP);
  const modal = useSpan(clock, MODAL_AT, 400);
  const modalY = useTransform(modal, [0, 1], [16, 0]);
  const progress = useTransform(clock, [RENDER_START, RENDER_END], [0, 1], { clamp: true });
  const percent = useTransform(progress, (p) => `${Math.round(p * 100)}%`);
  const ready = useSpan(clock, RENDER_END + 100, 400);
  const rendering = useTransform(ready, [0, 1], [1, 0]);

  return (
    <m.div className={cn("flex flex-col gap-4", className)} style={{ opacity: fade }}>
      <div className="flex items-center justify-between">
        <SceneLabel>Present</SceneLabel>
        <span className="flex items-center gap-2 font-mono text-[12px] text-stage-muted">
          <span className="live-dot" /> Playing
        </span>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-stage ring-1 ring-stage-line">
        {started && <DeckPlayer deck={DECKS[0]} clock={clock} />}
        <m.div className="absolute inset-0 bg-stage/70" style={{ opacity: modal }} />
        <m.div
          className="stage-card absolute inset-x-[12%] top-1/2 -translate-y-1/2 rounded-2xl p-5"
          style={{ opacity: modal, y: modalY }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-stage-ink">Export video</span>
            <span className="font-mono text-[12px] text-stage-muted">MP4 · 1080p</span>
          </div>
          <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
            <m.span className="absolute inset-0 origin-left rounded-full bg-accent" style={{ scaleX: progress }} />
          </div>
          <div className="relative mt-3 h-6 text-[14px]">
            <m.span className="absolute inset-0 flex items-center justify-between text-stage-muted" style={{ opacity: rendering }}>
              Rendering…
              <m.span className="font-mono text-[12px]">{percent}</m.span>
            </m.span>
            <m.span className="absolute inset-0 flex items-center gap-2 text-stage-ink" style={{ opacity: ready }}>
              <svg viewBox="0 0 12 12" className="size-3.5 stroke-accent" fill="none" strokeWidth="1.8" aria-hidden="true">
                <path d="M2.5 6.5l2.3 2.2 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ready
              <span className="ml-auto truncate font-mono text-[12px] text-stage-muted">compound-interest.mp4</span>
            </m.span>
          </div>
        </m.div>
      </div>
    </m.div>
  );
}

function SceneLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[12px] tracking-[0.1em] text-stage-muted uppercase">{children}</p>;
}
