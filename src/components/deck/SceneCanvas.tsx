"use client";

import { useEffect, useRef } from "react";
import type { Clock } from "@/components/anim/clock";
import { cn } from "@/lib/cn";
import { SCENES, type SceneName } from "./scenes";
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
    const draw = SCENES[scene];
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
      if (t < -200 || t > SLIDE_MS + 200 || width === 0) return;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      draw(ctx!, width, height, Math.max(0, t));
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      width = box.width;
      height = box.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      schedule();
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    const unsubscribe = clock.on("change", schedule);
    return () => {
      unsubscribe();
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [clock, scene, start]);

  return <canvas ref={canvasRef} aria-hidden="true" className={cn("pointer-events-none block", className)} />;
}
