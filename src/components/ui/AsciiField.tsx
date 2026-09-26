"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/*
 * Decorative background made of characters or pixels, drawn on a canvas.
 *   embers: heat rising from below, rendered as ASCII
 *   wave:   a slow interference pattern, rendered as ASCII
 *   pixels: ordered-dither squares that shimmer
 * It starts after the page is idle, draws ~20 frames a second only while on
 * screen, and shows a single still frame for reduced motion.
 */

type Variant = "embers" | "wave" | "pixels";
type Mask = "sides" | "bottom" | "band" | "floor";

type AsciiFieldProps = {
  variant?: Variant;
  mask?: Mask;
  tone?: "light" | "dark";
  /** Cell width in CSS px. */
  cell?: number;
  className?: string;
};

const RAMP = " .:-=+*x#%@";
const FRAME_MS = 50;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

// Value noise on a hashed lattice; smooth enough for heat and smoke.
const PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 7;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return Uint8Array.from([...p, ...p]);
})();

const hash = (x: number, y: number) => PERM[(PERM[x & 255] + y) & 255] / 255;

function noise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

const fbm = (x: number, y: number) =>
  noise(x, y) * 0.6 + noise(x * 2.1 + 5.2, y * 2.1 + 1.3) * 0.3 + noise(x * 4.3 + 9.1, y * 4.3 + 3.7) * 0.1;

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Where the effect shows, 0–1, for a cell at (u, v) in 0–1 space. */
function maskAt(mask: Mask, u: number, v: number) {
  switch (mask) {
    case "sides": {
      // Clear in the middle so headlines stay readable; heavier lower down,
      // fading out before the section's bottom edge.
      const edge = smoothstep(0.38, 1, Math.abs(u - 0.5) * 2);
      return edge * (0.45 + 0.55 * v) * (1 - smoothstep(0.86, 1, v));
    }
    case "bottom":
      return smoothstep(0.25, 1, v);
    case "band":
      return Math.exp(-(((v - 0.5) / 0.22) ** 2));
    case "floor": {
      const d = Math.hypot((u - 0.5) / 0.55, (v - 1) / 0.75);
      return (1 - smoothstep(0.15, 1, d)) * smoothstep(0, 0.25, v);
    }
  }
}

/** Field value 0–1 for a cell at column x, row y, time t (seconds). */
function fieldAt(variant: Variant, x: number, y: number, rows: number, t: number) {
  if (variant === "wave") {
    const warp = Math.sin(y * 0.18 + t * 0.6) * 1.6;
    const s = Math.sin(x * 0.11 + t * 0.9 + warp) * 0.5 + Math.sin(x * 0.05 - y * 0.2 - t * 0.5) * 0.5;
    return (s * 0.5 + 0.5) * (0.55 + 0.45 * fbm(x * 0.06, y * 0.08 + t * 0.2));
  }
  // embers / pixels: turbulence that rises (sampling moves down as t grows).
  const heat = (y / rows) ** 1.2;
  const n = fbm(x * 0.085 + Math.sin(t * 0.4 + y * 0.05) * 0.6, y * 0.13 + t * 1.7);
  return Math.min(1, Math.max(0, n * (0.45 + 0.85 * heat) - 0.08));
}

export function AsciiField({
  variant = "embers",
  mask = "sides",
  tone = "light",
  cell = 12,
  className,
}: AsciiFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ink = tone === "dark" ? "244,244,241" : "11,11,12";
    const ember = "255,90,31";
    const maxAlpha = tone === "dark" ? 0.22 : 0.17;
    const hotAlpha = tone === "dark" ? 0.75 : 0.5;
    const monoFamily =
      getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cellH = cell;
    let raf = 0;
    let last = 0;
    let onScreen = false;
    let started = false;
    const t0 = performance.now();

    function resize() {
      const box = canvas!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = box.width;
      height = box.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cellH = variant === "pixels" ? cell : Math.round(cell * 1.45);
      cols = Math.ceil(width / cell);
      rows = Math.ceil(height / cellH);
      ctx!.font = `${Math.round(cell * 1.08)}px ${monoFamily}`;
      ctx!.textBaseline = "top";
    }

    function render(t: number) {
      ctx!.clearRect(0, 0, width, height);
      // Bucket cells by colour so fillStyle changes a handful of times per frame.
      const buckets = new Map<string, number[]>();
      for (let y = 0; y < rows; y++) {
        const v = y / rows;
        for (let x = 0; x < cols; x++) {
          const m = maskAt(mask, x / cols, v);
          if (m < 0.03) continue;
          const value = fieldAt(variant, x, y, rows, t) * m;
          if (variant === "pixels") {
            if (value <= BAYER[(y % 4) * 4 + (x % 4)] * 0.9 + 0.08) continue;
          } else if (value < 0.1) continue;
          // Accent cells stay rare: hotter threshold for the blockier pixel look.
          const hot = value > (variant === "pixels" ? 0.86 : 0.72);
          const step = Math.min(4, Math.floor(value * 5));
          const key = hot ? "hot" : String(step);
          let list = buckets.get(key);
          if (!list) buckets.set(key, (list = []));
          list.push(x, y, value);
        }
      }
      for (const [key, list] of buckets) {
        const alpha = key === "hot" ? hotAlpha : (0.25 + Number(key) * 0.19) * maxAlpha;
        ctx!.fillStyle = `rgba(${key === "hot" ? ember : ink},${alpha.toFixed(3)})`;
        for (let i = 0; i < list.length; i += 3) {
          const px = list[i] * cell;
          const py = list[i + 1] * cellH;
          if (variant === "pixels") {
            ctx!.fillRect(px + 1, py + 1, cell - 2, cellH - 2);
          } else {
            const level = Math.min(RAMP.length - 1, Math.max(1, Math.round(list[i + 2] * (RAMP.length - 1) * 1.3)));
            ctx!.fillText(RAMP[level], px, py);
          }
        }
      }
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      last = now;
      render((now - t0) / 1000);
    }

    function sync() {
      cancelAnimationFrame(raf);
      if (!started) return;
      if (reduce) {
        render(3);
        return;
      }
      if (onScreen) raf = requestAnimationFrame(frame);
    }

    resize();
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (started && (reduce || !onScreen)) render((performance.now() - t0) / 1000);
    });
    resizeObserver.observe(canvas);

    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    intersection.observe(canvas);

    // Start once the page has settled, then fade the canvas in.
    const start = () => {
      started = true;
      canvas.dataset.ready = "";
      sync();
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 3000 })
      : window.setTimeout(start, 1500);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
    };
  }, [variant, mask, tone, cell]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute opacity-0 transition-opacity duration-1000 ease-brand data-[ready]:opacity-100",
        className,
      )}
    />
  );
}
