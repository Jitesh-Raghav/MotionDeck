"use client";

import { useEffect, useRef } from "react";

const W = 320;
const H = 58;
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const REVEAL_MS = 1400;

/**
 * The huge footer wordmark, drawn as pixels at a low resolution and scaled
 * up. It dithers in pixel by pixel the first time it enters the viewport.
 */
export function FooterWordmark() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Rasterise the word once, fitted to the full width.
    const scratch = document.createElement("canvas");
    scratch.width = W;
    scratch.height = H;
    const s = scratch.getContext("2d")!;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-sans").trim() || "sans-serif";
    s.font = `500 100px ${family}`;
    const size = (100 * (W - 4)) / s.measureText("Motiondeck").width;
    s.font = `500 ${size}px ${family}`;
    s.textBaseline = "alphabetic";
    s.fillText("Motiondeck", 2, H + size * 0.1); // descender-free word: crop the bottom a little
    const mask = s.getImageData(0, 0, W, H).data;

    const image = ctx.createImageData(W, H);
    const out = new Uint32Array(image.data.buffer);
    const ink = ((18 << 24) | (12 << 16) | (11 << 8) | 11) >>> 0; // rgba(11,11,12,0.07)
    const order = new Float32Array(W * H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const jitter = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        order[y * W + x] = BAYER[(y & 3) * 4 + (x & 3)] * 0.55 + (jitter - Math.floor(jitter)) * 0.45;
      }
    }

    const draw = (progress: number) => {
      out.fill(0);
      for (let i = 0; i < W * H; i++) if (mask[i * 4 + 3] > 110 && order[i] < progress) out[i] = ink;
      ctx.putImageData(image, 0, 0);
    };

    if (reduce) {
      draw(1);
      return;
    }
    draw(0);
    let raf = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / REVEAL_MS);
        draw(p * 1.02);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.3 });
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      aria-hidden="true"
      className="block h-auto w-full [image-rendering:pixelated]"
    />
  );
}
