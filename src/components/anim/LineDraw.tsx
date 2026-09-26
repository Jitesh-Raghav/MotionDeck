"use client";

import { useId } from "react";
import { m, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { svgId, useSpan, type Clock } from "./clock";

type LineDrawProps = {
  clock: Clock;
  /** Normalised values, 0 (bottom) to 1 (top). */
  values: number[];
  /** ms */
  start?: number;
  duration?: number;
  /** Portrait geometry, for 9:16 slides. */
  tall?: boolean;
  /** Fill the box exactly (sparklines). Strokes keep their width; no end dot or grid. */
  stretch?: boolean;
  className?: string;
};

const W = 400;
const PAD_X = 12;
const PAD_Y = 20;

function toPoints(values: number[], H: number) {
  return values.map((value, index) => ({
    x: PAD_X + (index * (W - PAD_X * 2)) / (values.length - 1),
    y: PAD_Y + (1 - value) * (H - PAD_Y * 2),
  }));
}

// Catmull-Rom through every point, expressed as cubic Béziers.
function smoothPath(points: { x: number; y: number }[]) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/**
 * Traces a trend left to right. The reveal is a clip rect scaled on X, so
 * only a transform animates.
 */
export function LineDraw({
  clock,
  values,
  start = 0,
  duration = 1400,
  tall = false,
  stretch = false,
  className,
}: LineDrawProps) {
  const clipId = `line-${svgId(useId())}`;
  const H = tall ? 440 : 200;
  const points = toPoints(values, H);
  const path = smoothPath(points);
  const end = points[points.length - 1];

  const reveal = useSpan(clock, start, duration);
  const area = useSpan(clock, start + duration * 0.5, duration * 0.6);
  const areaOpacity = useTransform(area, [0, 1], [0, 0.08]);
  const dot = useSpan(clock, start + duration * 0.9, 300);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio={stretch ? "none" : undefined}
      className={cn("block overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <m.rect
            x={0}
            y={0}
            width={W}
            height={H}
            style={{ scaleX: reveal, originX: 0, transformBox: "fill-box" }}
          />
        </clipPath>
      </defs>
      {!stretch && [0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD_X} x2={W - PAD_X} y1={H * f} y2={H * f} stroke="var(--s-line)" strokeDasharray="2 4" />
      ))}
      <m.path
        d={`${path} L ${end.x} ${H - PAD_Y} L ${points[0].x} ${H - PAD_Y} Z`}
        fill="var(--s-ink)"
        style={{ opacity: areaOpacity }}
      />
      <g clipPath={`url(#${clipId})`}>
        <path
          d={path}
          fill="none"
          stroke={stretch ? "var(--accent)" : "var(--s-ink)"}
          strokeWidth={stretch ? 2 : tall ? 5 : 2.5}
          strokeLinecap="round"
          vectorEffect={stretch ? "non-scaling-stroke" : undefined}
        />
      </g>
      {!stretch && (
        <m.circle
          cx={end.x}
          cy={end.y}
          r={tall ? 10 : 5}
          fill="var(--accent)"
          style={{ scale: dot, opacity: dot, transformBox: "fill-box", originX: 0.5, originY: 0.5 }}
        />
      )}
    </svg>
  );
}
