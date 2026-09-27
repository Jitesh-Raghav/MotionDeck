"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/cn";

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const CELL = 10;
const ROWS = 7;

// Small per-cell jitter so the dither doesn't read as a regular pattern.
const jitter = (x: number, y: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * A stepped pixel-dither edge where a light section meets a dark stage. It
 * sits just outside the stage (above it for "top", below it for "bottom")
 * and fills in as it scrolls into view. Before hydration the edge is simply
 * straight, so nothing shifts.
 */
export function PixelEdge({ side, className }: { side: "top" | "bottom"; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: canvasRef, offset: ["start end", "end 0.55"] });
  const fill = useTransform(scrollYProgress, [0, 1], [0.15, 1]);

  const draw = (amount: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const width = canvas.clientWidth;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(ROWS * CELL * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, ROWS * CELL);
    ctx.fillStyle = "#0b0b0c";
    const cols = Math.ceil(width / CELL);
    for (let row = 0; row < ROWS; row++) {
      // 0 at the far edge, 1 right against the stage.
      const depth = side === "top" ? (row + 1) / ROWS : (ROWS - row) / ROWS;
      const density = depth ** 1.6 * amount;
      for (let col = 0; col < cols; col++) {
        const threshold = BAYER[(row % 4) * 4 + (col % 4)] * 0.7 + jitter(col, row) * 0.3;
        if (threshold < density) ctx.fillRect(col * CELL, row * CELL, CELL, CELL);
      }
    }
  };

  useMotionValueEvent(fill, "change", (value) => {
    if (!reduce) draw(value);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const redraw = () => draw(reduce ? 1 : fill.get());
    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    return () => observer.disconnect();
    // draw only reads refs and the current props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, side]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("pointer-events-none block w-full", className)}
      style={{ height: ROWS * CELL }}
    />
  );
}
