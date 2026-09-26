"use client";

import { useId } from "react";
import { m, useTransform } from "motion/react";
import { CountUp } from "@/components/anim/CountUp";
import { LineDraw } from "@/components/anim/LineDraw";
import { svgId, useSpan, type Clock } from "@/components/anim/clock";
import { cn } from "@/lib/cn";

/*
 * Richer slide graphics for the example decks. Everything is sized in slide
 * units (--u) and scheduled from `start` on the clock; only transform and
 * opacity animate.
 */

export type BackdropKind = "orb" | "grid" | "dots" | "rings" | "none";

/** Ambient layer behind a slide's content. */
export function Backdrop({
  kind,
  clock,
  start,
  length,
}: {
  kind: BackdropKind;
  clock: Clock;
  start: number;
  length: number;
}) {
  const fade = useSpan(clock, start, 900);
  const driftA = useTransform(clock, [start, start + length], ["0%", "-8%"]);
  const driftB = useTransform(clock, [start, start + length], ["0%", "6%"]);
  const pan = useTransform(clock, [start, start + length], ["0%", "-4%"]);

  if (kind === "none") return null;

  if (kind === "orb") {
    return (
      <m.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: fade }}>
        <m.div
          className="absolute -top-[30%] -right-[12%] size-[calc(var(--u)*56)] rounded-full bg-[radial-gradient(closest-side,rgba(255,90,31,0.28),transparent)]"
          style={{ x: driftA, y: driftB }}
        />
        <m.div
          className="absolute -bottom-[35%] -left-[10%] size-[calc(var(--u)*44)] rounded-full bg-[radial-gradient(closest-side,rgba(255,150,90,0.14),transparent)]"
          style={{ x: driftB, y: driftA }}
        />
      </m.div>
    );
  }

  if (kind === "grid") {
    return (
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_75%)]"
        style={{ opacity: fade }}
      >
        <m.div
          className="absolute -inset-[10%] [background-image:linear-gradient(var(--s-line)_1px,transparent_1px),linear-gradient(90deg,var(--s-line)_1px,transparent_1px)] [background-size:calc(var(--u)*6)_calc(var(--u)*6)]"
          style={{ x: pan }}
        />
      </m.div>
    );
  }

  if (kind === "dots") {
    return (
      <m.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        style={{ opacity: fade }}
      >
        <m.div
          className="absolute -inset-[10%] [background-image:radial-gradient(var(--s-track)_1px,transparent_1.5px)] [background-size:calc(var(--u)*3)_calc(var(--u)*3)]"
          style={{ y: pan }}
        />
      </m.div>
    );
  }

  return (
    <m.div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden" style={{ opacity: fade }}>
      {[0, 1, 2].map((ring) => (
        <Ripple key={ring} clock={clock} start={start} offset={ring * 900} />
      ))}
    </m.div>
  );
}

/** Concentric circles expanding and fading, on a loop, off to the right. */
function Ripple({ clock, start, offset }: { clock: Clock; start: number; offset: number }) {
  const phase = (time: number) => (((time - start + offset) % 2700) + 2700) % 2700 / 2700;
  const scale = useTransform(clock, (time) => 0.4 + phase(time) * 0.9);
  const opacity = useTransform(clock, (time) => (1 - phase(time)) * 0.9);
  return (
    <m.span
      className="absolute top-1/2 right-[6%] size-[calc(var(--u)*46)] translate-x-1/3 -translate-y-1/2 rounded-full border border-[var(--s-line)]"
      style={{ scale, opacity }}
    />
  );
}

/** Small chip that pops in to make one point, e.g. "7.6× in 30 years". */
export function Callout({ clock, at, children }: { clock: Clock; at: number; children: React.ReactNode }) {
  const pop = useSpan(clock, at, 450);
  const scale = useTransform(pop, [0, 1], [0.85, 1]);
  return (
    <m.span
      className="absolute top-[calc(var(--u)*6)] right-[calc(var(--u)*7)] z-10 flex items-center gap-[calc(var(--u)*0.8)] rounded-full border border-accent/50 bg-accent/15 px-[calc(var(--u)*1.4)] py-[calc(var(--u)*0.6)] text-[max(7px,calc(var(--u)*1.6))] font-medium text-[var(--s-ink)]"
      style={{ opacity: pop, scale, originX: 1 }}
    >
      <span className="size-[calc(var(--u)*0.8)] rounded-full bg-accent" />
      {children}
    </m.span>
  );
}

/** Tag chips under a title, arriving one by one. */
export function Tags({ clock, at, tags }: { clock: Clock; at: number; tags: string[] }) {
  return (
    <div className="mt-[calc(var(--u)*2.6)] flex flex-wrap gap-[calc(var(--u)*1)]">
      {tags.map((tag, index) => (
        <Tag key={tag} clock={clock} at={at + index * 140}>
          {tag}
        </Tag>
      ))}
    </div>
  );
}

function Tag({ clock, at, children }: { clock: Clock; at: number; children: React.ReactNode }) {
  const opacity = useSpan(clock, at, 400);
  const y = useTransform(opacity, [0, 1], [6, 0]);
  return (
    <m.span
      className="rounded-full border border-[var(--s-line)] px-[calc(var(--u)*1.3)] py-[calc(var(--u)*0.5)] font-mono text-[max(7px,calc(var(--u)*1.3))] tracking-[0.08em] text-[var(--s-muted)] uppercase"
      style={{ opacity, y }}
    >
      {children}
    </m.span>
  );
}

/** A sparkline that draws in, for stat slides. */
export function Spark({ clock, at, values }: { clock: Clock; at: number; values: number[] }) {
  return (
    <div className="slide-wide-only absolute right-[calc(var(--u)*7)] bottom-[calc(var(--u)*9)] w-[calc(var(--u)*30)]">
      <LineDraw clock={clock} values={values} start={at} duration={1500} className="w-full" />
    </div>
  );
}

/* A vs B: two numbers race, their bars show the gap. */

export type VersusSide = { label: string; value: number; caption: string };

export function Versus({
  clock,
  start,
  left,
  right,
  format,
}: {
  clock: Clock;
  start: number;
  left: VersusSide;
  right: VersusSide;
  format: (value: number) => string;
}) {
  const max = Math.max(left.value, right.value);
  const vs = useSpan(clock, start + 600, 400);
  return (
    <div className="slide-stack mt-auto grid grid-cols-[1fr_auto_1fr] items-end gap-[calc(var(--u)*3)]">
      <VersusColumn clock={clock} at={start + 350} side={left} ratio={left.value / max} format={format} />
      <m.span
        className="self-center pb-[calc(var(--u)*3)] font-serif text-[calc(var(--u)*3)] text-[var(--s-muted)] italic"
        style={{ opacity: vs }}
      >
        vs
      </m.span>
      <VersusColumn clock={clock} at={start + 650} side={right} ratio={right.value / max} format={format} accent />
    </div>
  );
}

function VersusColumn({
  clock,
  at,
  side,
  ratio,
  format,
  accent = false,
}: {
  clock: Clock;
  at: number;
  side: VersusSide;
  ratio: number;
  format: (value: number) => string;
  accent?: boolean;
}) {
  const appear = useSpan(clock, at, 500);
  const grow = useSpan(clock, at + 200, 1400);
  const scaleX = useTransform(grow, (p) => p * ratio);
  return (
    <m.div style={{ opacity: appear }}>
      <p className="font-mono text-[max(7px,calc(var(--u)*1.35))] tracking-[0.1em] text-[var(--s-muted)] uppercase">
        {side.label}
      </p>
      <p className="mt-[calc(var(--u)*0.8)] text-[calc(var(--u)*6)] leading-none font-medium tracking-[-0.045em] text-[var(--s-ink)]">
        <CountUp clock={clock} from={0} to={side.value} format={format} start={at + 200} duration={1400} />
      </p>
      <div className="mt-[calc(var(--u)*1.8)] h-[calc(var(--u)*1)] overflow-hidden rounded-full bg-[var(--s-track)]">
        <m.span
          className={cn("block h-full w-full origin-left rounded-full", accent ? "bg-accent" : "bg-[var(--s-ink)]")}
          style={{ scaleX }}
        />
      </div>
      <p className="mt-[calc(var(--u)*1.2)] text-[max(7px,calc(var(--u)*1.7))] text-[var(--s-muted)]">{side.caption}</p>
    </m.div>
  );
}

/* Tick ring: 60 ticks light up around a dial to a percentage. */

const TICKS = 60;

// Round SVG coordinates so server and browser trig produce identical markup.
const round = (value: number) => Math.round(value * 100) / 100;

export function TickRing({ clock, start, value }: { clock: Clock; start: number; value: number }) {
  const lit = Math.round((value / 100) * TICKS);
  return (
    <div className="relative aspect-square h-full max-h-[calc(var(--u)*32)] max-w-full">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        {Array.from({ length: TICKS }, (_, i) => (
          <TickLine key={i} index={i} clock={clock} at={i < lit ? start + 300 + (i / lit) * 1400 : null} />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p className="text-[calc(var(--u)*6.4)] leading-none font-medium tracking-[-0.045em] text-[var(--s-ink)]">
          <CountUp clock={clock} from={0} to={value} format={(v) => `${v}%`} start={start + 300} duration={1400} />
        </p>
      </div>
    </div>
  );
}

function TickLine({ index, clock, at }: { index: number; clock: Clock; at: number | null }) {
  const angle = (index / TICKS) * Math.PI * 2 - Math.PI / 2;
  const [x1, y1, x2, y2] = [
    100 + Math.cos(angle) * 74,
    100 + Math.sin(angle) * 74,
    100 + Math.cos(angle) * 90,
    100 + Math.sin(angle) * 90,
  ].map(round);
  const opacity = useSpan(clock, at ?? 0, 180);
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--s-track)" strokeWidth={3} strokeLinecap="round" />
      {at !== null && (
        <m.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" style={{ opacity }} />
      )}
    </>
  );
}

/* KPI tiles: three numbers count up, each with a delta and a sparkline. */

export type Kpi = {
  label: string;
  from: number;
  to: number;
  format: (value: number) => string;
  delta: string;
  spark: number[];
};

export function KpiTiles({ clock, start, items }: { clock: Clock; start: number; items: Kpi[] }) {
  return (
    <div className="slide-stack mt-auto grid grid-cols-3 gap-[calc(var(--u)*1.8)]">
      {items.map((item, index) => (
        <KpiTile key={item.label} clock={clock} at={start + 350 + index * 220} item={item} />
      ))}
    </div>
  );
}

function KpiTile({ clock, at, item }: { clock: Clock; at: number; item: Kpi }) {
  const appear = useSpan(clock, at, 500);
  const y = useTransform(appear, [0, 1], [10, 0]);
  const delta = useSpan(clock, at + 1300, 400);
  return (
    <m.div
      className="rounded-[calc(var(--u)*1.4)] border border-[var(--s-line)] bg-white/[0.03] p-[calc(var(--u)*2)]"
      style={{ opacity: appear, y }}
    >
      <div className="flex items-center justify-between gap-[calc(var(--u)*1)]">
        <p className="min-w-0 truncate font-mono text-[max(7px,calc(var(--u)*1.3))] tracking-[0.1em] text-[var(--s-muted)] uppercase">
          {item.label}
        </p>
        <m.span
          className="shrink-0 rounded-full bg-accent/15 px-[calc(var(--u)*0.9)] py-[calc(var(--u)*0.3)] font-mono text-[max(7px,calc(var(--u)*1.25))] whitespace-nowrap text-accent"
          style={{ opacity: delta }}
        >
          {item.delta}
        </m.span>
      </div>
      <p className="mt-[calc(var(--u)*1)] text-[calc(var(--u)*4.4)] leading-none font-medium tracking-[-0.04em] text-[var(--s-ink)]">
        <CountUp clock={clock} from={item.from} to={item.to} format={item.format} start={at + 150} duration={1300} />
      </p>
      <LineDraw
        clock={clock}
        values={item.spark}
        start={at + 300}
        duration={1300}
        stretch
        className="mt-[calc(var(--u)*1.4)] h-[calc(var(--u)*4)] w-full"
      />
    </m.div>
  );
}

/* Feature cards with small line icons. */

export type Feature = { icon: "bolt" | "palette" | "link"; title: string; body: string };

const ICONS: Record<Feature["icon"], React.ReactNode> = {
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 100 18c1.1 0 1.8-.9 1.5-1.9-.3-1 .4-2.1 1.5-2.1H17a4 4 0 004-4c0-5.5-4-10-9-10z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" />
    </>
  ),
};

export function FeatureCards({ clock, start, items }: { clock: Clock; start: number; items: Feature[] }) {
  return (
    <div className="slide-stack mt-auto grid grid-cols-3 gap-[calc(var(--u)*1.8)]">
      {items.map((item, index) => (
        <FeatureCard key={item.title} clock={clock} at={start + 350 + index * 240} item={item} />
      ))}
    </div>
  );
}

function FeatureCard({ clock, at, item }: { clock: Clock; at: number; item: Feature }) {
  const appear = useSpan(clock, at, 550);
  const y = useTransform(appear, [0, 1], [14, 0]);
  const scale = useTransform(appear, [0, 1], [0.96, 1]);
  const icon = useSpan(clock, at + 250, 450);
  const iconScale = useTransform(icon, [0, 1], [0.6, 1]);
  return (
    <m.div
      className="rounded-[calc(var(--u)*1.4)] border border-[var(--s-line)] bg-white/[0.03] p-[calc(var(--u)*2.2)]"
      style={{ opacity: appear, y, scale }}
    >
      <m.span
        className="grid size-[calc(var(--u)*5)] place-items-center rounded-[calc(var(--u)*1.2)] bg-accent/15"
        style={{ scale: iconScale }}
      >
        <svg viewBox="0 0 24 24" className="size-[60%] stroke-accent" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICONS[item.icon]}
        </svg>
      </m.span>
      <p className="mt-[calc(var(--u)*1.8)] text-[calc(var(--u)*2.3)] leading-tight font-medium tracking-[-0.02em] text-[var(--s-ink)]">
        {item.title}
      </p>
      <p className="mt-[calc(var(--u)*0.6)] text-[max(7px,calc(var(--u)*1.6))] text-[var(--s-muted)]">{item.body}</p>
    </m.div>
  );
}

/* Black hole: a hot accretion disk wraps a dark event horizon while matter orbits. */

const STARS = Array.from({ length: 22 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: round(r(1) * 400), y: round(r(2) * 220), size: round(0.7 + r(3) * 1.1), phase: r(4) * 6.28 };
});

const CX = 200;
const CY = 118;
const RX = 138;
const RY = 30;

export function BlackHoleDiagram({ clock, start }: { clock: Clock; start: number }) {
  const heat = `disk-heat-${svgId(useId())}`;
  const disk = useSpan(clock, start + 200, 900);
  const hole = useSpan(clock, start + 400, 700);
  const holeScale = useTransform(hole, [0, 1], [0.6, 1]);
  const labelA = useSpan(clock, start + 1300, 500);
  const labelB = useSpan(clock, start + 1600, 500);
  const upper = `M ${CX - RX} ${CY} A ${RX} ${RY} 0 0 1 ${CX + RX} ${CY}`;
  const lower = `M ${CX - RX} ${CY} A ${RX} ${RY} 0 0 0 ${CX + RX} ${CY}`;

  return (
    <svg viewBox="0 0 400 220" className="h-full w-auto max-w-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={heat} x1="0" x2="1">
          <stop offset="0" stopColor="#FF5A1F" stopOpacity="0.2" />
          <stop offset="0.5" stopColor="#FFB36B" />
          <stop offset="1" stopColor="#FF5A1F" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {STARS.map((star, index) => (
        <Star key={index} clock={clock} {...star} />
      ))}
      {/* Far side of the disk, behind the hole. */}
      <m.g style={{ opacity: disk }}>
        <path d={upper} fill="none" stroke={`url(#${heat})`} strokeWidth={14} strokeOpacity={0.18} />
        <path d={upper} fill="none" stroke={`url(#${heat})`} strokeWidth={4} />
      </m.g>
      {Array.from({ length: 12 }, (_, i) => (
        <OrbitParticle key={`back-${i}`} clock={clock} start={start} index={i} side="back" />
      ))}
      <m.g style={{ scale: holeScale, opacity: hole, originX: 0.5, originY: 0.5, transformBox: "fill-box" }}>
        <circle cx={CX} cy={CY} r={40} fill="none" stroke="#FFB36B" strokeOpacity={0.35} strokeWidth={6} />
        <circle cx={CX} cy={CY} r={36} fill="#000" stroke="var(--s-ink)" strokeOpacity={0.7} strokeWidth={1.2} />
      </m.g>
      {/* Near side of the disk, in front of the hole. */}
      <m.g style={{ opacity: disk }}>
        <path d={lower} fill="none" stroke={`url(#${heat})`} strokeWidth={16} strokeOpacity={0.2} />
        <path d={lower} fill="none" stroke={`url(#${heat})`} strokeWidth={5} />
      </m.g>
      {Array.from({ length: 12 }, (_, i) => (
        <OrbitParticle key={`front-${i}`} clock={clock} start={start} index={i} side="front" />
      ))}
      <m.g style={{ opacity: labelA }}>
        <line x1={CX - 30} y1={CY - 24} x2={CX - 92} y2={CY - 70} stroke="var(--s-muted)" strokeWidth={1} />
        <text x={CX - 96} y={CY - 76} textAnchor="end" fontSize={13} fill="var(--s-ink)" className="@max-[480px]:text-[17px]">
          Event horizon
        </text>
      </m.g>
      <m.g style={{ opacity: labelB }}>
        <line x1={CX + 110} y1={CY + 20} x2={CX + 150} y2={CY + 62} stroke="var(--s-muted)" strokeWidth={1} />
        <text x={CX + 146} y={CY + 80} textAnchor="start" fontSize={13} fill="var(--s-ink)" className="@max-[480px]:text-[17px]">
          Accretion disk
        </text>
      </m.g>
    </svg>
  );
}

function Star({ clock, x, y, size, phase }: { clock: Clock; x: number; y: number; size: number; phase: number }) {
  const opacity = useTransform(clock, (time) => 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(time / 420 + phase)));
  return <m.circle cx={x} cy={y} r={size} fill="var(--s-ink)" style={{ opacity }} />;
}

/**
 * A particle on the disk ellipse. Each is drawn twice (behind and in front of
 * the hole) and shows only on its current side, so the hole hides it.
 */
function OrbitParticle({
  clock,
  start,
  index,
  side,
}: {
  clock: Clock;
  start: number;
  index: number;
  side: "back" | "front";
}) {
  const speed = 900 + (index % 4) * 260;
  const angleAt = (time: number) => (index / 12) * Math.PI * 2 + (time - start) / speed;
  const x = useTransform(clock, (time) => Math.cos(angleAt(time)) * RX * (0.8 + (index % 3) * 0.1));
  const y = useTransform(clock, (time) => Math.sin(angleAt(time)) * RY * (0.8 + (index % 3) * 0.1));
  const opacity = useTransform(clock, (time) => {
    if (time < start + 500) return 0;
    const inFront = Math.sin(angleAt(time)) > 0;
    return (side === "front") === inFront ? 0.9 : 0;
  });
  return <m.circle cx={CX} cy={CY} r={index % 3 === 0 ? 2.4 : 1.6} fill="#FFD2A8" style={{ x, y, opacity }} />;
}
