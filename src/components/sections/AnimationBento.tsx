"use client";

import { m } from "motion/react";
import { BarChart } from "@/components/anim/BarChart";
import { CountUp } from "@/components/anim/CountUp";
import { LineDraw } from "@/components/anim/LineDraw";
import { SectionWipe } from "@/components/anim/SectionWipe";
import { SplitCompare } from "@/components/anim/SplitCompare";
import { StaggerList } from "@/components/anim/StaggerList";
import { TimelineDraw } from "@/components/anim/TimelineDraw";
import { TypeReveal } from "@/components/anim/TypeReveal";
import { useLoopClock, useLoopFade, useNearOnScreen, type Clock } from "@/components/anim/clock";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/cn";
import { STAGGER } from "@/lib/motion";

type TileSpec = {
  name: string;
  useCase: string;
  /** Loop length, ms */
  loop: number;
  className?: string;
  label: string;
  render: (clock: Clock) => React.ReactNode;
};

const meters = (value: number) => `${value.toLocaleString("en-US")} m`;

const tiles: TileSpec[] = [
  {
    name: "Count-up",
    useCase: "Make a key number land.",
    loop: 4400,
    className: "md:col-span-2",
    label: "Example: 8,849 metres, the height of Mount Everest, counting up.",
    render: (clock) => (
      <div className="flex w-full flex-col px-[8%]">
        <span className="text-[clamp(52px,10cqw,104px)] leading-none font-medium tracking-[-0.045em] text-stage-ink">
          <CountUp clock={clock} from={0} to={8849} format={meters} start={200} duration={1700} />
        </span>
        <span className="mt-4 flex items-center gap-2 text-[15px] text-stage-muted">
          <span className="size-1.5 rounded-full bg-accent" />
          Height of Mount Everest
        </span>
      </div>
    ),
  },
  {
    name: "Bar build",
    useCase: "Show growth one period at a time.",
    loop: 4400,
    label: "Example: world population by year, in billions, growing bar by bar.",
    render: (clock) => (
      <BarChart
        clock={clock}
        start={200}
        stagger={280}
        highlight={3}
        className="w-[84%]"
        bars={[
          { label: "1950", value: 2.5, display: "2.5B" },
          { label: "1975", value: 4.1, display: "4.1B" },
          { label: "2000", value: 6.1, display: "6.1B" },
          { label: "2025", value: 8.2, display: "8.2B" },
        ]}
      />
    ),
  },
  {
    name: "Type reveal",
    useCase: "Give a headline its moment.",
    loop: 4000,
    label: "Example: the headline “Ideas that land.” appearing letter by letter.",
    render: (clock) => (
      <p className="px-[10%] text-[clamp(32px,11cqw,44px)] leading-[1.05] font-medium tracking-[-0.035em] text-stage-ink">
        <TypeReveal clock={clock} text="Ideas that land." start={200} stagger={45} serifWords={["land."]} />
      </p>
    ),
  },
  {
    name: "Line draw",
    useCase: "Trace a trend as you talk.",
    loop: 4000,
    label: "Example: a rising trend line drawing from left to right.",
    render: (clock) => (
      <LineDraw clock={clock} start={200} duration={1600} values={[0.16, 0.3, 0.24, 0.44, 0.38, 0.6, 0.56, 0.84]} className="w-[84%]" />
    ),
  },
  {
    name: "Timeline",
    useCase: "Walk through milestones in order.",
    loop: 4800,
    className: "md:col-span-2",
    label: "Example: the Apollo programme, from the 1961 goal to the 1969 landing.",
    render: (clock) => (
      <TimelineDraw
        clock={clock}
        start={200}
        highlight={2}
        className="w-[86%] max-w-[520px]"
        milestones={[
          { label: "1961", value: "Goal set", caption: "JFK speech" },
          { label: "1968", value: "Orbit", caption: "Apollo 8" },
          { label: "1969", value: "Landing", caption: "Apollo 11" },
        ]}
      />
    ),
  },
  {
    name: "Staggered list",
    useCase: "Reveal points one by one.",
    loop: 4000,
    label: "Example: a four-point lesson outline appearing one line at a time.",
    render: (clock) => (
      <StaggerList
        clock={clock}
        start={200}
        className="w-[80%] text-[15px]"
        items={["What inflation is", "Why prices rise", "How rates respond", "What it means for you"]}
      />
    ),
  },
  {
    name: "Split compare",
    useCase: "Put before and after side by side.",
    loop: 4400,
    className: "md:col-span-2",
    label: "Example: stocks and bonds compared side by side.",
    render: (clock) => (
      <SplitCompare
        clock={clock}
        start={200}
        className="w-[88%] max-w-[560px] text-[15px]"
        left={{ label: "Stocks", title: "Higher growth", points: ["Bigger swings", "Suits long horizons"] }}
        right={{ label: "Bonds", title: "Steadier income", points: ["Smaller swings", "Suits shorter goals"] }}
      />
    ),
  },
  {
    name: "Section transition",
    useCase: "Move between chapters cleanly.",
    loop: 4200,
    className: "md:col-span-2",
    label: "Example: chapter one sliding away as chapter two sweeps in.",
    render: (clock) => (
      <SectionWipe
        clock={clock}
        start={1000}
        className="h-full w-full"
        from={{ number: "01", title: "The basics" }}
        to={{ number: "02", title: "Going deeper" }}
      />
    ),
  },
];

export function AnimationBento() {
  return (
    <ul className="mt-12 grid grid-flow-row-dense gap-4 md:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile, index) => (
        <Reveal key={tile.name} as="li" delay={(index % 4) * STAGGER} className={cn("flex", tile.className)}>
          <Tile tile={tile} />
        </Reveal>
      ))}
    </ul>
  );
}

function Tile({ tile }: { tile: TileSpec }) {
  const { ref, onScreen, near } = useNearOnScreen<HTMLDivElement>(0.25);
  const clock = useLoopClock(tile.loop, onScreen);
  const fade = useLoopFade(clock, tile.loop);

  return (
    <SpotlightCard className="stage-card flex w-full flex-col overflow-hidden rounded-card">
      <div ref={ref} role="img" aria-label={tile.label} className="@container relative grid h-[248px] place-items-center">
        <m.div className="grid h-full w-full place-items-center" style={{ opacity: fade }}>
          {near && tile.render(clock)}
        </m.div>
      </div>
      <div className="relative border-t border-stage-line px-6 py-5">
        <h3 className="text-[17px] leading-6 font-medium tracking-[-0.01em] text-stage-ink">{tile.name}</h3>
        <p className="mt-1 text-[15px] leading-6 text-stage-muted">{tile.useCase}</p>
      </div>
    </SpotlightCard>
  );
}
