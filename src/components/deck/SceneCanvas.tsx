"use client";

import { useEffect, useRef } from "react";
import type { Clock } from "@/components/anim/clock";
import { cn } from "@/lib/cn";
import type { SceneName } from "./scenes";
import { SLIDE_MS } from "./timing";

/**
 * Draws a motion-graphic scene for a slide, driven by the slide's clock.
 * It redraws at most once per animation frame when the clock moves, and only
 * while its slide is on screen.
 */
export function SceneCanvas({
  scene,
  clock,
  start,
  className,
}: {
  scene: SceneName;
  clock: Clock;
  start: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let draw: ((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void) | null = null;
    let cancelled = false;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = 0;
    let lastDraw = 0;

    function render(now: number) {
      frame = 0;
      if (now - lastDraw < 30) {
        // Too soon: try again next frame so the final state is never missed.
        frame = requestAnimationFrame(render);
        return;
      }
      lastDraw = now;
      const t = clock.get() - start;
      if (!draw || t < -200 || t > SLIDE_MS + 200 || width === 0) return;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      draw(ctx!, width, height, Math.max(0, t));
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const resize = () => {
      // Draw in layout pixels (ignoring CSS transforms), so a scaled-down
      // thumbnail keeps the slide's proportions; sharpen by the real on-screen
      // scale so it doesn't use more pixels than it shows.
      const box = canvas.getBoundingClientRect();
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      const onScreen = width ? box.width / width : 1;
      dpr = Math.min(2, window.devicePixelRatio || 1) * Math.min(1, onScreen);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      schedule();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const unsubscribe = clock.on("change", schedule);
    import("./scenes").then(({ SCENES }) => {
      if (cancelled) return;
      draw = SCENES[scene];
      schedule();
    });
    return () => {
      cancelled = true;
      unsubscribe();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [clock, scene, start]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("pointer-events-none block", className)} />;
}
