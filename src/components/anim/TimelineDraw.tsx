"use client";

import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { ease } from "@/lib/motion";
import { useSpan, type Clock } from "./clock";

export type Milestone = { label: string; value: string; caption?: string };

type TimelineProps = {
  clock: Clock;
  milestones: Milestone[];
  /** ms */
  start?: number;
  /** Time to draw between two milestones. */
  segment?: number;
  /** Pause at each milestone. */
  hold?: number;
  /** Index of the milestone drawn in the accent colour. */
  highlight?: number;
  className?: string;
};

const linear = (t: number) => t;

/**
 * Line progress 0 → 1 that draws to each milestone, pauses, then moves on.
 * Milestones sit at the centres of equal segments.
 */
function useTimelineProgress(
  clock: Clock,
  count: number,
  start: number,
  segment: number,
  hold: number,
) {
  const input: number[] = [start];
  const output: number[] = [0];
  const easings: Array<(t: number) => number> = [];
  const arrivals: number[] = [];
  let t = start;
  for (let i = 0; i < count; i++) {
    t += segment;
    input.push(t);
    output.push((i + 0.5) / count);
    easings.push(ease);
    arrivals.push(t);
    t += hold;
    input.push(t);
    output.push((i + 0.5) / count);
    easings.push(linear);
  }
  input.push(t + segment * 0.6);
  output.push(1);
  easings.push(ease);

  const progress = useTransform(clock, input, output, { clamp: true, ease: easings });
  return { progress, arrivals };
}

const W = 400;
const H = 160;
const LINE_Y = 64;
const X0 = 12;
const X1 = W - 12;

/** Horizontal timeline for wide slides. */
export function TimelineDraw({
  clock,
  milestones,
  start = 0,
  segment = 450,
  hold = 150,
  highlight,
  className,
}: TimelineProps) {
  const count = milestones.length;
  const { progress, arrivals } = useTimelineProgress(clock, count, start, segment, hold);
  const xs = milestones.map((_, i) => X0 + ((i + 0.5) * (X1 - X0)) / count);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("block overflow-visible", className)} aria-hidden="true">
      <line x1={X0} x2={X1} y1={LINE_Y} y2={LINE_Y} stroke="var(--s-line)" strokeWidth={2} />
      <m.line
        x1={X0}
        x2={X1}
        y1={LINE_Y}
        y2={LINE_Y}
        stroke="var(--s-ink)"
        strokeWidth={2}
        style={{ scaleX: progress, originX: 0, transformBox: "fill-box" }}
      />
      {milestones.map((milestone, index) => (
        <MilestoneMark
          key={milestone.label}
          clock={clock}
          at={arrivals[index]}
          x={xs[index]}
          milestone={milestone}
          accent={index === highlight}
        />
      ))}
    </svg>
  );
}

function MilestoneMark({
  clock,
  at,
  x,
  milestone,
  accent,
}: {
  clock: Clock;
  at: number;
  x: number;
  milestone: Milestone;
  accent: boolean;
}) {
  const pop = useSpan(clock, at - 60, 360);
  const text = useSpan(clock, at, 500);
  const y = useTransform(text, [0, 1], [6, 0]);

  return (
    <g>
      <m.circle
        cx={x}
        cy={LINE_Y}
        r={7}
        fill={accent ? "var(--accent)" : "var(--s-ink)"}
        style={{ scale: pop, transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
      />
      <m.g style={{ opacity: text, y }}>
        <text
          x={x}
          y={LINE_Y - 26}
          textAnchor="middle"
          fontSize={11}
          letterSpacing="0.06em"
          fill="var(--s-muted)"
          className="font-mono uppercase @max-[480px]:text-[14px]"
        >
          {milestone.label}
        </text>
        <text
          x={x}
          y={LINE_Y + 44}
          textAnchor="middle"
          fontSize={24}
          fontWeight={500}
          fill="var(--s-ink)"
          className="@max-[480px]:text-[27px]"
        >
          {milestone.value}
        </text>
        {milestone.caption && (
          <text
            x={x}
            y={LINE_Y + 66}
            textAnchor="middle"
            fontSize={12}
            fill="var(--s-muted)"
            className="@max-[480px]:text-[15px]"
          >
            {milestone.caption}
          </text>
        )}
      </m.g>
    </g>
  );
}

/**
 * Vertical timeline for tall (9:16) slides. Sized in slide units (--u), so
 * it scales with the frame.
 */
export function TimelineVertical({
  clock,
  milestones,
  start = 0,
  segment = 450,
  hold = 150,
  highlight,
  className,
}: TimelineProps) {
  const { progress, arrivals } = useTimelineProgress(clock, milestones.length, start, segment, hold);

  return (
    <div className={cn("relative flex h-full flex-col", className)} aria-hidden="true">
      <span className="absolute inset-y-0 left-[calc(var(--u)*1.2)] w-px bg-[var(--s-line)]" />
      <m.span
        className="absolute inset-y-0 left-[calc(var(--u)*1.2)] w-[2px] -translate-x-[0.5px] bg-[var(--s-ink)]"
        style={{ scaleY: progress, originY: 0 }}
      />
      {milestones.map((milestone, index) => (
        <VerticalMark
          key={milestone.label}
          clock={clock}
          at={arrivals[index]}
          milestone={milestone}
          accent={index === highlight}
        />
      ))}
    </div>
  );
}

function VerticalMark({
  clock,
  at,
  milestone,
  accent,
}: {
  clock: Clock;
  at: number;
  milestone: Milestone;
  accent: boolean;
}) {
  const pop = useSpan(clock, at - 60, 360);
  const text = useSpan(clock, at, 500);
  const x = useTransform(text, [0, 1], [6, 0]);
  return (
    <div className="relative flex flex-1 items-center pl-[calc(var(--u)*5)]">
      <m.span
        className={cn(
          "absolute left-[calc(var(--u)*1.2)] size-[calc(var(--u)*2)] -translate-x-1/2 rounded-full",
          accent ? "bg-accent" : "bg-[var(--s-ink)]",
        )}
        style={{ scale: pop }}
      />
      <m.div className="flex flex-col" style={{ opacity: text, x }}>
        <span className="font-mono text-[max(7px,calc(var(--u)*1.3))] tracking-[0.08em] text-[var(--s-muted)] uppercase">
          {milestone.label}
        </span>
        <span className="text-[calc(var(--u)*3.2)] leading-tight font-medium tracking-[-0.02em] text-[var(--s-ink)]">
          {milestone.value}
        </span>
        {milestone.caption && (
          <span className="text-[max(7px,calc(var(--u)*1.5))] text-[var(--s-muted)]">{milestone.caption}</span>
        )}
      </m.div>
    </div>
  );
}
