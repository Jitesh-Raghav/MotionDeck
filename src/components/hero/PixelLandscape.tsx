"use client";

import { useEffect, useRef } from "react";

/*
 * "Golden hour over the stage": an original pixel landscape drawn in code.
 *
 * The canvas renders at a low internal resolution (384px wide, 192 on phones)
 * and is scaled up with `image-rendering: pixelated`. Sky and shading use 4x4
 * Bayer ordered dithering, so there are no smooth gradients anywhere. Every
 * visit looks the same (fixed seed). It runs at 30fps, pauses off screen and
 * in hidden tabs, and draws one still frame for reduced motion.
 *
 * Layout contract: the canvas fills its section. The horizon sits a little
 * below the element marked [data-hero-copy]; the bottom rows dissolve into the
 * page so the product window can overlap them.
 */

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const bayer = (x: number, y: number) => BAYER[(y & 3) * 4 + (x & 3)];

type RGB = [number, number, number];
const hex = (value: string): RGB => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];
// Canvas ImageData is little-endian RGBA packed into a Uint32.
const pack = ([r, g, b]: RGB, a = 255) => ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
const mixRGB = (a: RGB, b: RGB, k: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * k),
  Math.round(a[1] + (b[1] - a[1]) * k),
  Math.round(a[2] + (b[2] - a[2]) * k),
];

const SKY_TOP = hex("#EFE9E0");
const SKY_MID = hex("#F5D9C6");
const SKY_LOW = hex("#F2B996");
const EMBER = hex("#FF5A1F");
const GLOW_A = hex("#FFB08A");
const GLOW_B = hex("#FFCDB0");
const CLOUD = hex("#FBF5EE");
const CLOUD_SHADE = hex("#E4CFC0");
const CLOUD_RIM = hex("#FFE7D6");

type Layer = { color: RGB; rim: RGB; shade: RGB; base: number; amp: number; freq: number; speed: number; seed: number };

// Back to front. `base` is a fraction of the ground depth below the horizon.
const LAYERS: Layer[] = [
  { color: hex("#E3D9CD"), rim: hex("#F6D9C4"), shade: hex("#D8CDBF"), base: 0.02, amp: 9, freq: 0.018, speed: 0.35, seed: 11 },
  { color: hex("#CCC2B4"), rim: hex("#EBCBB3"), shade: hex("#BEB4A6"), base: 0.2, amp: 11, freq: 0.024, speed: 0.8, seed: 23 },
  { color: hex("#A39A8E"), rim: hex("#CFAF98"), shade: hex("#938A7F"), base: 0.4, amp: 10, freq: 0.03, speed: 1.4, seed: 37 },
  { color: hex("#2A2A2C"), rim: hex("#5A4238"), shade: hex("#1E1E20"), base: 0.6, amp: 8, freq: 0.036, speed: 2.3, seed: 53 },
];

// Seeded 1D value noise, smooth enough for ridgelines.
function hash1(n: number, seed: number) {
  const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function noise1(x: number, seed: number) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash1(i, seed) * (1 - u) + hash1(i + 1, seed) * u;
}
const ridge = (x: number, seed: number) =>
  noise1(x, seed) * 0.62 + noise1(x * 2.3 + 7.1, seed + 1) * 0.28 + noise1(x * 5.1 + 3.3, seed + 2) * 0.1;

const CLOUDS = [
  { x: 0.06, y: 0.2, w: 38, speed: 1.2 },
  { x: 0.34, y: 0.07, w: 24, speed: 0.7 },
  { x: 0.58, y: 0.36, w: 30, speed: 1.4 },
  { x: 0.8, y: 0.16, w: 44, speed: 1 },
  { x: 0.97, y: 0.44, w: 20, speed: 1.7 },
];

// A few birds crossing the sky, and fireflies over the front hill.
const BIRDS = [
  { dx: 0, dy: 0, phase: 0 },
  { dx: -7, dy: 3, phase: 0.35 },
  { dx: -12, dy: -2, phase: 0.7 },
];
const FIREFLIES = Array.from({ length: 12 }, (_, i) => ({
  x: ((Math.sin(i * 91.7) * 43758.5453) % 1 + 1) % 1,
  rise: 0.4 + (((Math.sin(i * 12.3) * 9171.13) % 1 + 1) % 1) * 0.6,
  phase: (((Math.sin(i * 47.1) * 3113.7) % 1 + 1) % 1) * 10,
}));

const FRAME_MS = 1000 / 30;
const FRAME_MS_NARROW = 1000 / 20;
const INTRO_MS = 750;

export function PixelLandscape() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const section = canvas?.parentElement;
    if (!canvas || !ctx || !section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let horizon = 0;
    let fadeRows = 0;
    let image: ImageData | null = null;
    let pixels = new Uint32Array(0);
    let sky = new Uint32Array(0); // sky + sun + glow, drawn once per resize
    let reveal = new Float32Array(0); // per-pixel intro threshold, built once per resize
    let raf = 0;
    let last = 0;
    let onScreen = true;
    let introStart = -1;
    let parallax = 0;
    let parallaxTarget = 0;
    const t0 = performance.now();

    function measure() {
      const box = section!.getBoundingClientRect();
      const width = box.width;
      const height = box.height;
      W = width < 640 ? 192 : 384;
      const scale = width / W;
      H = Math.max(80, Math.round(height / scale));
      canvas!.width = W;
      canvas!.height = H;
      image = ctx!.createImageData(W, H);
      pixels = new Uint32Array(image.data.buffer);

      const copy = section!.querySelector("[data-hero-copy]")?.getBoundingClientRect();
      const copyBottom = copy ? (copy.bottom - box.top) / scale : H * 0.5;
      horizon = Math.round(Math.min(H - 60 / scale - 36, Math.max(copyBottom + 44 / scale, H * 0.54)));
      fadeRows = Math.max(6, Math.round(56 / scale));
      buildSky();
      if (introStart >= 0 || reveal.length === 0) buildReveal();
    }

    function buildReveal() {
      reveal = new Float32Array(W * H);
      for (let i = 0; i < reveal.length; i++) reveal[i] = hash1(i, 5);
    }

    function buildSky() {
      sky = new Uint32Array(W * horizon);
      const steps = 8;
      const palette = Array.from({ length: steps + 1 }, (_, i) => {
        const k = i / steps;
        return pack(k < 0.55 ? mixRGB(SKY_TOP, SKY_MID, k / 0.55) : mixRGB(SKY_MID, SKY_LOW, (k - 0.55) / 0.45));
      });
      for (let y = 0; y < horizon; y++) {
        const t = (y / horizon) ** 1.7 * steps;
        const low = Math.floor(t);
        const frac = t - low;
        for (let x = 0; x < W; x++) {
          sky[y * W + x] = palette[Math.min(steps, low + (bayer(x, y) < frac ? 1 : 0))];
        }
      }
      // Sun: an ember disc sitting on the horizon, with a dithered glow.
      const sunX = Math.round(W * 0.76);
      const radius = Math.max(8, Math.round(W * 0.042));
      const sun = pack(EMBER);
      const glowA = pack(GLOW_A);
      const glowB = pack(GLOW_B);
      for (let y = Math.max(0, horizon - radius * 3); y < horizon; y++) {
        for (let x = Math.max(0, sunX - radius * 3); x < Math.min(W, sunX + radius * 3); x++) {
          const d = Math.hypot(x - sunX, (y - horizon) * 1.05);
          if (d <= radius) sky[y * W + x] = sun;
          else if (d < radius * 2.6) {
            const k = 1 - (d - radius) / (radius * 1.6);
            const b = bayer(x, y);
            if (b < k * k * 0.55) sky[y * W + x] = glowA;
            else if (b < k * 0.9) sky[y * W + x] = glowB;
          }
        }
      }
    }

    function drawClouds(t: number) {
      const white = pack(CLOUD);
      const shade = pack(CLOUD_SHADE);
      const rim = pack(CLOUD_RIM);
      for (const cloud of CLOUDS) {
        const span = W + cloud.w * 2;
        const cx = ((cloud.x * W + t * cloud.speed) % span) - cloud.w;
        const cy = Math.round(cloud.y * horizon);
        const rx = cloud.w / 2;
        const ry = Math.max(3, cloud.w / 7);
        for (let y = Math.round(cy - ry * 1.6); y <= cy + ry; y++) {
          if (y < 0 || y >= horizon) continue;
          for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
            if (x < 0 || x >= W) continue;
            // Three lumps: a wide base and two puffs on top.
            const base = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
            const puffA = ((x - cx + rx * 0.3) / (rx * 0.45)) ** 2 + ((y - cy + ry * 0.9) / (ry * 1.1)) ** 2;
            const puffB = ((x - cx - rx * 0.2) / (rx * 0.35)) ** 2 + ((y - cy + ry * 1.2) / ry) ** 2;
            const inside = Math.min(base, puffA, puffB);
            if (inside > 1) continue;
            // Soft dithered edge, shaded underside.
            if (inside > 0.72 && bayer(x, y) < (inside - 0.72) * 3.5) continue;
            const b = bayer(x, y);
            pixels[y * W + x] = y > cy + ry * 0.15 && b < 0.65 ? shade : y < cy - ry * 0.9 && b < 0.5 ? rim : white;
          }
        }
      }
    }

    // Tiny projector screen on the front hill; its bars grow, hold, reset.
    function drawProjector(t: number, crestAt: (x: number) => number) {
      const w = W < 300 ? 16 : 24;
      const h = Math.round(w * 0.62);
      const px = Math.round(W * 0.13);
      const ground = Math.round(Math.min(crestAt(px + 2), crestAt(px + w - 3)));
      const top = ground - h - 5;
      const frame = pack(hex("#141416"));
      const screen = pack(hex("#F4F1EA"));
      const bar = pack(hex("#B3AEA3"));
      const hot = pack(EMBER);
      const put = (x: number, y: number, c: number) => {
        if (x >= 0 && x < W && y >= 0 && y < H) pixels[y * W + x] = c;
      };
      for (let y = top; y < top + h; y++) {
        for (let x = px; x < px + w; x++) {
          const edge = y === top || y === top + h - 1 || x === px || x === px + w - 1;
          put(x, y, edge ? frame : screen);
        }
      }
      // Legs.
      for (let y = top + h; y <= ground; y++) {
        put(px + 3, y, frame);
        put(px + w - 4, y, frame);
      }
      // Bars.
      const heights = [0.35, 0.55, 0.48, 0.8];
      const cycle = (t % 4.4) / 4.4;
      const build = Math.min(1, cycle / 0.6);
      const barW = Math.max(2, Math.floor((w - 6) / heights.length) - 1);
      heights.forEach((bh, i) => {
        const grow = Math.max(0, Math.min(1, build * heights.length - i));
        const size = Math.round((h - 4) * bh * grow);
        const x0 = px + 3 + i * (barW + 1);
        for (let k = 0; k < size; k++) {
          for (let dx = 0; dx < barW; dx++) put(x0 + dx, top + h - 2 - k, i === heights.length - 1 ? hot : bar);
        }
      });
    }

    // Small signs of life: a flock crossing every ~45s, wings flapping, and
    // fireflies drifting up and blinking over the dark front hill.
    function drawLife(t: number, frontCrest: (x: number) => number) {
      const ink = pack(hex("#4A3E38"));
      const loop = 45;
      const p = (t % loop) / loop;
      const leadX = -20 + p * (W + 40);
      const leadY = horizon * 0.34 + Math.sin(p * Math.PI * 2) * 6;
      for (const bird of BIRDS) {
        const bx = Math.round(leadX + bird.dx);
        const by = Math.round(leadY + bird.dy);
        const up = Math.sin(t * 7 + bird.phase * 6) > 0;
        const cells = up
          ? [[-2, -1], [-1, 0], [0, 0], [1, 0], [2, -1]]
          : [[-2, 1], [-1, 0], [0, 0], [1, 0], [2, 1]];
        for (const [cx, cy] of cells) {
          const x = bx + cx;
          const y = by + cy;
          if (x >= 0 && x < W && y >= 0 && y < horizon) pixels[y * W + x] = ink;
        }
      }
      const glowA = pack(hex("#FF9A5C"));
      const glowB = pack(hex("#FFD2A8"));
      for (const fly of FIREFLIES) {
        const x = Math.round(fly.x * W + Math.sin(t * 0.6 + fly.phase) * 3);
        const base = frontCrest(x);
        const cycle = ((t + fly.phase) % 6) / 6;
        const y = Math.round(base + 10 - cycle * 26 * fly.rise);
        const on = Math.sin((t + fly.phase) * 2.2) > 0.1 && cycle < 0.9;
        if (!on || x < 0 || x >= W || y < 0 || y >= H) continue;
        pixels[y * W + x] = cycle < 0.5 ? glowA : glowB;
      }
    }

    function render(now: number) {
      if (!image) return;
      const t = reduce ? 3 : (now - t0) / 1000;
      const ground = H - horizon;
      pixels.set(sky, 0);
      pixels.fill(0, W * horizon);
      drawClouds(t);

      parallax += (parallaxTarget - parallax) * 0.08;
      const crests = LAYERS.map((layer, index) => {
        const drift = t * layer.speed + (index === 3 ? parallax : index === 2 ? parallax * 0.5 : 0);
        const base = horizon + layer.base * ground;
        return (x: number) => base - layer.amp * ridge((x + drift) * layer.freq, layer.seed);
      });

      const packed = LAYERS.map((layer) => ({ color: pack(layer.color), rim: pack(layer.rim), shade: pack(layer.shade) }));
      const col = new Float32Array(LAYERS.length);
      for (let x = 0; x < W; x++) {
        for (let i = 0; i < LAYERS.length; i++) col[i] = crests[i](x);
        const startY = Math.max(0, Math.floor(Math.min(col[0], col[1], col[2], col[3])));
        for (let y = startY; y < H; y++) {
          let layer = -1;
          for (let i = LAYERS.length - 1; i >= 0; i--) {
            if (y >= col[i]) {
              layer = i;
              break;
            }
          }
          if (layer < 0) continue;
          const depth = y - col[layer];
          const b = bayer(x, y);
          const p = packed[layer];
          let color = p.color;
          if (depth < 1.5 || (depth < 3 && b < 0.45)) color = p.rim;
          else if (b < Math.min(0.5, (depth - 5) / 50)) color = p.shade;
          pixels[y * W + x] = color;
        }
      }

      drawProjector(t, crests[3]);
      drawLife(t, crests[3]);

      // Bottom rows dissolve into the page.
      for (let y = H - fadeRows; y < H; y++) {
        const k = (y - (H - fadeRows) + 1) / fadeRows;
        for (let x = 0; x < W; x++) if (bayer(x, y) < k) pixels[y * W + x] = 0;
      }

      // Intro: the scene resolves out of pixel noise.
      if (introStart >= 0) {
        const p = Math.min(1, (now - introStart) / INTRO_MS);
        if (p < 1) {
          const noiseColors = [pack(SKY_TOP), pack(SKY_LOW), pack(LAYERS[1].color), pack(LAYERS[2].color)];
          for (let i = 0; i < pixels.length; i++) {
            const r = reveal[i];
            if (r > p) pixels[i] = r > p + 0.25 ? 0 : noiseColors[(i * 7 + Math.floor(now / 60)) & 3];
          }
        } else introStart = -1;
      }

      ctx!.putImageData(image, 0, 0);
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (now - last < (W < 300 ? FRAME_MS_NARROW : FRAME_MS)) return;
      last = now;
      render(now);
    }

    function sync() {
      cancelAnimationFrame(raf);
      if (reduce) render(performance.now());
      else if (onScreen && !document.hidden) raf = requestAnimationFrame(frame);
    }

    measure();
    if (!reduce) introStart = performance.now();
    render(performance.now());
    canvas.dataset.ready = "";
    sync();

    const resizeObserver = new ResizeObserver(() => {
      measure();
      render(performance.now());
    });
    resizeObserver.observe(section);
    const intersection = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    intersection.observe(canvas);
    const onVisibility = () => sync();
    document.addEventListener("visibilitychange", onVisibility);
    // Up to 6px of parallax on the nearest hill, in canvas pixels.
    const onPointer = (event: PointerEvent) => {
      const scale = section.clientWidth / W;
      parallaxTarget = ((event.clientX / window.innerWidth) * 2 - 1) * (6 / scale);
    };
    if (!reduce) window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <>
      {/* Same palette as a plain gradient, shown until the canvas draws. */}
      <div aria-hidden="true" className="hero-fallback pointer-events-none absolute inset-0 -z-20" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0 [image-rendering:pixelated] data-[ready]:opacity-100"
      />
    </>
  );
}
