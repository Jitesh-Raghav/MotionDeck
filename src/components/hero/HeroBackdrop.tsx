"use client";

import { useEffect, useRef } from "react";

/*
 * The hero's living background, drawn on one canvas:
 *   1. a pixel-dithered glow sitting on the product window's top edge (a horizon)
 *   2. ASCII flame tongues rising from that horizon up both sides of the screen
 *   3. pixel sparks drifting up out of the flames
 *   4. pixel-art slide cards floating in the upper corners, charts animating inside
 * Every piece of copy (marked data-hero-clear) is measured and kept clear. It starts
 * once the page is idle, runs only while visible, and shows one still frame
 * for reduced motion.
 */

const RAMP = " .:-=+*x#%@";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

const PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 11;
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

const fbm = (x: number, y: number) => noise(x, y) * 0.62 + noise(x * 2.2 + 3.1, y * 2.2 + 7.7) * 0.38;

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const SPARKS = Array.from({ length: 70 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 91.7 + n * 47.3) * 43758.5453) % 1 + 1) % 1;
  return { side: r(1) < 0.5 ? -1 : 1, spread: r(2), speed: 18 + r(3) * 34, phase: r(4), size: r(5) < 0.3 ? 4 : 3 };
});

const FLAME_CELL = { wide: [11, 16], narrow: [14, 20] } as const;
const PIXEL = 7;

export function HeroBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mono =
      getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";
    const glowLayer = document.createElement("canvas");
    const glowCtx = glowLayer.getContext("2d")!;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let horizon = 0;
    // Boxes around each piece of copy, in canvas px; the effect stays out of them.
    let clearBoxes: Array<{ left: number; top: number; right: number; bottom: number }> = [];
    let raf = 0;
    let last = 0;
    // Phones: bigger cells, 12 fps, no sparks.
    let narrow = false;
    let FLAME_CELL_W: number = FLAME_CELL.wide[0];
    let FLAME_CELL_H: number = FLAME_CELL.wide[1];
    let lastGlow = -1;
    let onScreen = false;
    let started = false;
    const t0 = performance.now();

    function measure() {
      const box = canvas!.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = box.width;
      H = box.height;
      narrow = W < 768;
      [FLAME_CELL_W, FLAME_CELL_H] = narrow ? FLAME_CELL.narrow : FLAME_CELL.wide;
      for (const c of [canvas!, glowLayer]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      glowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const windowTop = document.querySelector("[data-hero-horizon]")?.getBoundingClientRect().top;
      horizon = windowTop !== undefined ? Math.min(H, windowTop - box.top + 40) : H * 0.72;

      clearBoxes = [...document.querySelectorAll("[data-hero-clear]")].map((element) => {
        const r = element.getBoundingClientRect();
        return { left: r.left - box.left, top: r.top - box.top, right: r.right - box.left, bottom: r.bottom - box.top };
      });
      lastGlow = -1;
    }

    /** 0 on or right next to copy, easing to 1 a little way out. */
    function openness(x: number, y: number) {
      let open = 1;
      for (const b of clearBoxes) {
        const dx = Math.max(b.left - x, 0, x - b.right);
        const dy = Math.max(b.top - y, 0, y - b.bottom);
        open = Math.min(open, smoothstep(14, 70, Math.hypot(dx, dy)));
        if (open === 0) break;
      }
      return open;
    }

    function drawGlow(t: number) {
      glowCtx.clearRect(0, 0, W, H);
      const top = Math.max(0, horizon - 200);
      const bottom = Math.min(H, horizon + 160);
      const spread = W * 0.48;
      for (let y = top; y < bottom; y += PIXEL) {
        const dy = y - horizon;
        // Light spilling out along the window's top edge: tight above, softer below.
        const vertical = 0.8 * (dy < 0 ? Math.exp(-((dy / 70) ** 2)) : Math.exp(-((dy / 80) ** 2)));
        for (let x = 0; x < W; x += PIXEL) {
          const horizontal = Math.exp(-(((x - W / 2) / spread) ** 2));
          let g = vertical * horizontal;
          if (g < 0.05) continue;
          g *= 0.72 + 0.4 * noise(x * 0.012, y * 0.02 - t * 0.5);
          g *= 0.35 + 0.65 * openness(x, y);
          const threshold = BAYER[((y / PIXEL) % 4) * 4 + ((x / PIXEL) % 4)];
          if (g <= threshold) continue;
          glowCtx.fillStyle = g > 0.6 ? "rgba(255,90,31,0.3)" : "rgba(255,150,100,0.16)";
          glowCtx.fillRect(x, y, PIXEL - 1, PIXEL - 1);
        }
      }
    }

    function drawFlames(t: number) {
      const cols = Math.ceil(W / FLAME_CELL_W);
      const baseRow = Math.floor(horizon / FLAME_CELL_H);
      const buckets = new Map<string, number[]>();
      for (let x = 0; x < cols; x++) {
        const u = x / cols;
        const side = smoothstep(0.18, 0.92, Math.abs(u - 0.5) * 2);
        if (side < 0.02) continue;
        // Broad tongues whose heights drift and flicker; tallest at the outer edges.
        const reach = horizon * (0.12 + 0.88 * side ** 1.3);
        // Squaring the noise opens gaps between tongues.
        const tongue = reach * (0.22 + 0.78 * fbm(x * 0.07, t * 0.55) ** 1.25) * (0.85 + 0.15 * noise(x * 0.4, t * 3));
        for (let y = Math.max(0, baseRow - Math.ceil(tongue / FLAME_CELL_H) - 1); y <= baseRow; y++) {
          const py = y * FLAME_CELL_H;
          const along = 1 - (horizon - py) / Math.max(1, tongue); // 1 at the base, 0 at the tip
          if (along <= 0) continue;
          const turbulence = fbm(x * 0.13, y * 0.1 + t * 2.3);
          let v = along ** 1.15 * (0.3 + 0.95 * turbulence) * (0.45 + 0.55 * side);
          v *= openness(x * FLAME_CELL_W, py);
          if (v < 0.12) continue;
          const key = v > 0.78 ? "a" : v > 0.55 ? "b" : v > 0.34 ? "c" : "d";
          let list = buckets.get(key);
          if (!list) buckets.set(key, (list = []));
          list.push(x * FLAME_CELL_W, py, v);
        }
      }
      const colors: Record<string, string> = {
        a: "rgba(255,90,31,0.85)",
        b: "rgba(255,122,58,0.62)",
        c: "rgba(255,168,118,0.5)",
        d: "rgba(11,11,12,0.16)",
      };
      for (const [key, list] of buckets) {
        ctx!.fillStyle = colors[key];
        for (let i = 0; i < list.length; i += 3) {
          const level = Math.min(RAMP.length - 1, Math.max(1, Math.round(list[i + 2] * (RAMP.length - 1) * 1.2)));
          ctx!.fillText(RAMP[level], list[i], list[i + 1]);
        }
      }
    }

    function drawSparks(t: number) {
      for (const spark of SPARKS) {
        const range = horizon * 0.95;
        const travelled = (t * spark.speed + spark.phase * range) % range;
        const y = horizon - travelled;
        const edge = 0.62 + spark.spread * 0.36; // stay out toward the sides
        const x = W / 2 + spark.side * edge * (W / 2) + Math.sin(t * 1.3 + spark.phase * 9) * 14;
        const life = 1 - travelled / range;
        const alpha = life * 0.75 * openness(x, y);
        if (alpha < 0.04) continue;
        ctx!.fillStyle = `rgba(255,${Math.round(90 + 80 * (1 - life))},31,${alpha.toFixed(3)})`;
        const s = spark.size;
        ctx!.fillRect(Math.round(x / s) * s, Math.round(y / s) * s, s, s);
      }
    }

    /*
     * Pixel-art slide cards: a dithered panel with a title bar and a chart that
     * builds, holds and resets. Drawn cell by cell on a coarse grid.
     */
    const CARDS = [
      { x: 0.035, dy: 12, cols: 32, rows: 18, kind: "bars", phase: 0 },
      { x: 0.965, dy: 40, cols: 32, rows: 18, kind: "line", phase: 1.7 },
    ] as const;

    function drawCards(t: number) {
      if (W < 1200) return;
      const cell = 6;
      // Anchor to the subhead (the third piece of hero copy).
      const anchor = clearBoxes[2]?.top ?? H * 0.3;
      for (const card of CARDS) {
        const width = card.cols * cell;
        const left = card.x < 0.5 ? Math.round(W * card.x) : Math.round(W * card.x - width);
        const top = Math.round((anchor + card.dy) / cell) * cell + Math.round(Math.sin(t * 0.7 + card.phase) * 1.5) * cell;
        const cycle = ((t + card.phase * 2) % 5) / 5; // 0..1 over five seconds
        const build = Math.min(1, cycle / 0.55);
        const fade = cycle > 0.88 ? 1 - (cycle - 0.88) / 0.12 : 1;
        const put = (cx: number, cy: number, color: string) => {
          const x = left + cx * cell;
          const y = top + cy * cell;
          const a = openness(x + cell / 2, y + cell / 2);
          if (a < 0.05) return;
          ctx!.globalAlpha = a;
          ctx!.fillStyle = color;
          ctx!.fillRect(x, y, cell - 1, cell - 1);
        };
        // Panel: solid border, dithered body.
        for (let cy = 0; cy < card.rows; cy++) {
          for (let cx = 0; cx < card.cols; cx++) {
            const edge = cx === 0 || cy === 0 || cx === card.cols - 1 || cy === card.rows - 1;
            if (edge) put(cx, cy, "rgba(11,11,12,0.16)");
            else if (BAYER[(cy % 4) * 4 + (cx % 4)] < 0.1) put(cx, cy, "rgba(11,11,12,0.08)");
          }
        }
        // Title bar and a subtitle line.
        for (let cx = 3; cx < 15; cx++) put(cx, 3, "rgba(11,11,12,0.28)");
        for (let cx = 3; cx < 10; cx++) put(cx, 5, "rgba(11,11,12,0.13)");
        put(card.cols - 4, 3, "rgba(255,90,31,0.8)");

        const base = card.rows - 4;
        if (card.kind === "bars") {
          const heights = [3, 5, 4, 7, 9];
          heights.forEach((height, b) => {
            const grow = Math.max(0, Math.min(1, build * heights.length - b));
            const shown = Math.round(height * grow);
            for (let k = 0; k < shown; k++) {
              for (let wdt = 0; wdt < 3; wdt++) {
                put(4 + b * 6 + wdt, base - k, b === heights.length - 1 ? `rgba(255,90,31,${0.85 * fade})` : `rgba(11,11,12,${0.3 * fade})`);
              }
            }
          });
        } else {
          const span = card.cols - 8;
          const shown = Math.round(span * build);
          for (let k = 0; k <= shown; k++) {
            const u = k / span;
            const cy = base - Math.round(u ** 1.8 * 9 + Math.sin(u * 9) * 0.8);
            put(4 + k, cy, `rgba(11,11,12,${0.34 * fade})`);
            // Soft fill under the line.
            for (let fill = cy + 2; fill <= base; fill += 2) {
              if ((4 + k + fill) % 2 === 0) put(4 + k, fill, `rgba(255,90,31,${0.12 * fade})`);
            }
            if (k === shown) put(4 + k, cy, `rgba(255,90,31,${0.9 * fade})`);
          }
        }
        ctx!.globalAlpha = 1;
      }
    }

    function render(now: number) {
      const t = (now - t0) / 1000;
      // The dithered glow changes slowly; redraw it at ~8 fps.
      if (lastGlow < 0 || now - lastGlow > 120) {
        drawGlow(t);
        lastGlow = now;
      }
      ctx!.clearRect(0, 0, W, H);
      ctx!.drawImage(glowLayer, 0, 0, W, H);
      ctx!.font = `${Math.round(FLAME_CELL_W * 1.1)}px ${mono}`;
      ctx!.textBaseline = "top";
      drawCards(t);
      drawFlames(t);
      if (!narrow) drawSparks(t);
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < (narrow ? 83 : 42)) return; // ~12 fps on phones, ~24 elsewhere
      last = now;
      render(now);
    }

    function sync() {
      cancelAnimationFrame(raf);
      if (!started) return;
      if (reduce) render(t0 + 4000);
      else if (onScreen) raf = requestAnimationFrame(frame);
    }

    measure();
    const resizeObserver = new ResizeObserver(() => {
      measure();
      if (started) render(performance.now());
    });
    resizeObserver.observe(canvas);
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    intersection.observe(canvas);

    const start = () => {
      measure(); // fonts have settled by now
      started = true;
      canvas.dataset.ready = "";
      sync();
    };
    const idle = window.requestIdleCallback
      ? window.requestIdleCallback(start, { timeout: 1500 })
      : window.setTimeout(start, 700);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1200px] w-full opacity-0 transition-opacity duration-1000 ease-brand data-[ready]:opacity-100"
    />
  );
}
