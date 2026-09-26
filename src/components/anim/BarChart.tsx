"use client";

import { m } from "motion/react";
import { cn } from "@/lib/cn";
import { useSpan, type Clock } from "./clock";

export type BarDatum = { label: string; value: number; display: string };

type BarChartProps = {
  clock: Clock;
  bars: BarDatum[];
  /** ms */
  start?: number;
  stagger?: number;
  grow?: number;
  /** Index of the bar drawn in the accent colour. */
  highlight?: number;
  /** Portrait geometry with larger labels, for 9:16 slides. */
  tall?: boolean;
  className?: string;
};

const W = 400;
const LEFT = 8;
const RIGHT = W - 8;

const GEOMETRY = {
  wide: { height: 240, baseline: 196, top: 40, value: 14, label: 11 },
  tall: { height: 460, baseline: 400, top: 70, value: 30, label: 22 },
};

type Geometry = (typeof GEOMETRY)["wide"];

/** Bars grow one after another from a shared baseline. */
export function BarChart({
  clock,
  bars,
  start = 0,
  stagger = 350,
  grow = 600,
  highlight,
  tall = false,
  className,
}: BarChartProps) {
  const geometry = tall ? GEOMETRY.tall : GEOMETRY.wide;
  const { height: H, baseline: BASELINE, top: TOP } = geometry;
  const max = Math.max(...bars.map((bar) => bar.value));
  const slot = (RIGHT - LEFT) / bars.length;
  const barWidth = slot * 0.52;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("block overflow-visible", className)} aria-hidden="true">
      <line x1={LEFT} x2={RIGHT} y1={BASELINE + 0.5} y2={BASELINE + 0.5} stroke="var(--s-line)" />
      {bars.map((bar, index) => (
        <Bar
          key={bar.label}
          clock={clock}
          start={start + index * stagger}
          grow={grow}
          x={LEFT + slot * index + (slot - barWidth) / 2}
          width={barWidth}
          height={Math.max(2, ((BASELINE - TOP) * bar.value) / max)}
          bar={bar}
          accent={index === highlight}
          geometry={geometry}
          tall={tall}
        />
      ))}
    </svg>
  );
}

function Bar({
  clock,
  start,
  grow,
  x,
  width,
  height,
  bar,
  accent,
  geometry,
  tall,
}: {
  clock: Clock;
  start: number;
  grow: number;
  x: number;
  width: number;
  height: number;
  bar: BarDatum;
  accent: boolean;
  geometry: Geometry;
  tall: boolean;
}) {
  const BASELINE = geometry.baseline;
  const scaleY = useSpan(clock, start, grow);
  const labelOpacity = useSpan(clock, start + grow * 0.6, 300);
  const center = x + width / 2;

  return (
    <g>
      <m.rect
        x={x}
        y={BASELINE - height}
        width={width}
        height={height}
        rx={3}
        fill={accent ? "var(--accent)" : "var(--s-track)"}
        style={{ scaleY, originY: 1, transformBox: "fill-box" }}
      />
      <m.text
        x={center}
        y={BASELINE - height - (tall ? 16 : 10)}
        textAnchor="middle"
        fontSize={geometry.value}
        fontWeight={500}
        fill="var(--s-ink)"
        className={cn("tabular-nums", !tall && "@max-[480px]:text-[18px]")}
        style={{ opacity: labelOpacity }}
      >
        {bar.display}
      </m.text>
      <text
        x={center}
        y={BASELINE + (tall ? 40 : 24)}
        textAnchor="middle"
        fontSize={geometry.label}
        fill="var(--s-muted)"
        className={cn("font-mono uppercase", !tall && "@max-[480px]:text-[13px]")}
        letterSpacing="0.06em"
      >
        {bar.label}
      </text>
    </g>
  );
}
