"use client";

import { m, useTransform } from "motion/react";
import { BarChart } from "@/components/anim/BarChart";
import { CountUp } from "@/components/anim/CountUp";
import { LineDraw } from "@/components/anim/LineDraw";
import { StaggerList } from "@/components/anim/StaggerList";
import { TypeReveal } from "@/components/anim/TypeReveal";
import { useLoopClock, useLoopFade, useNearOnScreen, type Clock } from "@/components/anim/clock";
import { Reveal } from "@/components/ui/Reveal";
import { STAGGER } from "@/lib/motion";

const LOOP = 4600;
const millions = (thousands: number) => `$${(thousands / 1000).toFixed(1)}M`;

type Audience = {
  title: string;
  body: string;
  label: string;
  mini: (clock: Clock) => React.ReactNode;
};

const audiences: Audience[] = [
  {
    title: "YouTube explainers",
    body: "Record your screen and you're done.",
    label: "Example: an explainer title typing in above a video progress bar.",
    mini: (clock) => <ExplainerMini clock={clock} />,
  },
  {
    title: "Online courses",
    body: "Lessons that hold attention.",
    label: "Example: a lesson outline appearing point by point.",
    mini: (clock) => (
      <div className="w-full px-5">
        <p className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">Lesson 3 · Inflation</p>
        <StaggerList
          clock={clock}
          start={250}
          stagger={200}
          className="mt-2 text-[14px]"
          items={["What inflation is", "Why prices rise", "What it means for you"]}
        />
      </div>
    ),
  },
  {
    title: "Pitch decks",
    body: "Numbers that land.",
    label: "Example: revenue counting up to $2.4M beside a growing bar chart.",
    mini: (clock) => (
      <div className="grid w-full grid-cols-[1fr_1fr] items-end gap-3 px-5">
        <div>
          <p className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">Revenue</p>
          <p className="mt-1 text-[30px] leading-none font-medium tracking-[-0.04em] text-ink">
            <CountUp clock={clock} from={1200} to={2400} format={millions} start={250} duration={1400} />
          </p>
        </div>
        <BarChart
          clock={clock}
          start={300}
          stagger={180}
          highlight={3}
          className="w-full"
          bars={[
            { label: "Q1", value: 1.2, display: "" },
            { label: "Q2", value: 1.5, display: "" },
            { label: "Q3", value: 1.9, display: "" },
            { label: "Q4", value: 2.4, display: "" },
          ]}
        />
      </div>
    ),
  },
  {
    title: "Webinars",
    body: "Keep the room with you.",
    label: "Example: a live session slide with a trend line drawing across it.",
    mini: (clock) => (
      <div className="relative w-full px-5">
        <span className="absolute -top-2 right-5 flex items-center gap-1.5 rounded-full bg-ink px-2 py-0.5 font-mono text-[11px] tracking-[0.1em] text-bg uppercase">
          <span className="live-dot" /> Live
        </span>
        <p className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">Signups this quarter</p>
        <LineDraw clock={clock} start={250} duration={1500} values={[0.1, 0.24, 0.2, 0.42, 0.5, 0.72, 0.92]} className="mt-2 w-full" />
      </div>
    ),
  },
];

export function BuiltForCards() {
  return (
    <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {audiences.map((audience, index) => (
        <Reveal key={audience.title} as="li" delay={index * STAGGER} className="flex">
          <Card audience={audience} />
        </Reveal>
      ))}
    </ul>
  );
}

function Card({ audience }: { audience: Audience }) {
  const { ref, onScreen, near } = useNearOnScreen<HTMLDivElement>(0.3);
  const clock = useLoopClock(LOOP, onScreen);
  const fade = useLoopFade(clock, LOOP);
  return (
    <article className="flex w-full flex-col rounded-card border border-hairline bg-surface p-3">
      <div
        ref={ref}
        role="img"
        aria-label={audience.label}
        className="slide-light relative grid aspect-[16/11] place-items-center overflow-hidden rounded-[14px] bg-bg ring-1 ring-hairline"
      >
        <m.div className="grid w-full place-items-center" style={{ opacity: fade }}>
          {near && audience.mini(clock)}
        </m.div>
      </div>
      <div className="px-3 pt-5 pb-3">
        <h3 className="text-[18px] leading-6 font-medium tracking-[-0.015em]">{audience.title}</h3>
        <p className="mt-1.5 text-[15px] leading-6 text-muted">{audience.body}</p>
      </div>
    </article>
  );
}

function ExplainerMini({ clock }: { clock: Clock }) {
  const scrub = useTransform(clock, [0, LOOP - 450], [0.08, 0.9]);
  return (
    <div className="absolute inset-0 flex flex-col justify-center px-5">
      <p className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">Science explainer</p>
      <p className="mt-1.5 text-[24px] leading-[1.05] font-medium tracking-[-0.03em] text-ink">
        <TypeReveal clock={clock} text="How black holes form" start={250} stagger={35} serifWords={["form"]} />
      </p>
      <div className="absolute inset-x-5 bottom-4 flex items-center gap-2">
        <svg viewBox="0 0 12 12" className="size-2.5 fill-ink" aria-hidden="true">
          <path d="M3 1.5v9l7.5-4.5z" />
        </svg>
        <span className="relative h-[3px] flex-1 rounded-full bg-ink/10">
          <m.span className="absolute inset-0 origin-left rounded-full bg-accent" style={{ scaleX: scrub }} />
        </span>
      </div>
    </div>
  );
}
