/*
 * Motion-graphic scenes for the example decks, drawn on canvas.
 *
 * Every scene is a pure function of (size, t): t is milliseconds since its
 * slide started. Nothing is stored between frames, so scenes pause, loop and
 * freeze on a still frame exactly with the slide's clock. Scenes are drawn on
 * the dark stage.
 */

export type SceneName =
  | "spiral"
  | "moneyCurve"
  | "race"
  | "snowfall"
  | "starTrails"
  | "dashboard"
  | "ticker"
  | "sparksRise"
  | "radar"
  | "network"
  | "warp"
  | "stars"
  | "gargantua"
  | "collapse"
  | "gravityWell"
  | "rocket"
  | "confetti"
  | "trajectory"
  | "gears"
  | "liftoff";

type Ctx = CanvasRenderingContext2D;
type RGB = readonly [number, number, number];
type Scene = (ctx: Ctx, w: number, h: number, t: number) => void;

const TAU = Math.PI * 2;
const EMBER: RGB = [255, 90, 31];
const AMBER: RGB = [255, 179, 107];
const CREAM: RGB = [255, 226, 196];
const WHITE: RGB = [244, 244, 241];

/** Scale for fixed-size details, set per draw from the canvas size. */
let S = 1;
const px = (n: number) => n * S;

/** Small canvases (phones, thumbnails) draw every other particle. */
let STEP = 1;
const halves = new WeakMap<object, unknown[]>();
function thin<T>(items: T[]): T[] {
  if (STEP === 1) return items;
  let half = halves.get(items) as T[] | undefined;
  if (!half) halves.set(items, (half = items.filter((_, i) => i % 2 === 0)));
  return half;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const span = (t: number, start: number, duration: number) => clamp01((t - start) / duration);
const easeOut = (v: number) => 1 - (1 - clamp01(v)) ** 3;
const easeIn = (v: number) => clamp01(v) ** 3;
const easeInOut = (v: number) => {
  const x = clamp01(v);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
};
const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mixRGB = (a: RGB, b: RGB, k: number): RGB => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${Math.max(0, Math.min(1, a)).toFixed(3)})`;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function field<T>(count: number, seed: number, make: (r: () => number, i: number) => T): T[] {
  const r = seeded(seed);
  return Array.from({ length: count }, (_, i) => make(r, i));
}

/* Soft glow sprites, rendered once per colour and reused with drawImage. */
const sprites = new Map<string, HTMLCanvasElement>();

function sprite(color: RGB) {
  const key = color.join(",");
  let canvas = sprites.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const c = canvas.getContext("2d")!;
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, rgba(color, 0.95));
    g.addColorStop(0.5, rgba(color, 0.28));
    g.addColorStop(1, rgba(color, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, 64, 64);
    sprites.set(key, canvas);
  }
  return canvas;
}

function glow(ctx: Ctx, x: number, y: number, radius: number, color: RGB, alpha: number) {
  if (alpha <= 0.01 || radius <= 0) return;
  // Big halos use a real gradient; an upscaled sprite would show its square edge.
  if (radius > 60) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, rgba(color, alpha * 0.9));
    g.addColorStop(0.5, rgba(color, alpha * 0.28));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TAU);
    ctx.fill();
    return;
  }
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.drawImage(sprite(color), x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

function label(ctx: Ctx, text: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = "left") {
  ctx.font = `500 ${size}px ui-monospace, "Geist Mono", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/** Twinkling background stars. */
const STARS = field(90, 3, (r) => ({ x: r(), y: r(), size: 0.4 + r() * 1.2, phase: r() * TAU }));

function starfield(ctx: Ctx, w: number, h: number, t: number, alpha = 1) {
  for (const s of thin(STARS)) {
    const a = (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t / 500 + s.phase))) * alpha;
    ctx.fillStyle = rgba(WHITE, a);
    ctx.fillRect(s.x * w, s.y * h, s.size, s.size);
  }
}

/* ---------- Compound interest ---------- */

/** A golden-angle spiral that keeps adding rings: growth on top of growth. */
const spiral: Scene = (ctx, w, h, t) => {
  const cx = w * 0.56;
  const cy = h * 0.5;
  const R = Math.min(w, h) * 0.44;
  const total = 340;
  const shown = Math.floor(18 + (total - 18) * easeOut(span(t, 150, 2800)));
  const rotation = t * 0.00014;
  const scale = R / Math.sqrt(total);
  const unit = Math.min(w, h) / 320;

  ctx.lineWidth = 1;
  for (const k of [0.36, 0.68, 1]) {
    ctx.strokeStyle = rgba(WHITE, 0.05);
    ctx.beginPath();
    ctx.arc(cx, cy, R * k, 0, TAU);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < shown; i += STEP) {
    const angle = i * 2.39996 + rotation;
    const radius = scale * Math.sqrt(i);
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    const k = i / total;
    const fresh = clamp01((shown - i) / 14);
    const color = mixRGB(CREAM, EMBER, k);
    glow(ctx, x, y, (2.5 + k * 7) * unit, color, 0.55 * fresh);
  }
  ctx.globalCompositeOperation = "source-over";
  glow(ctx, cx, cy, R * 0.35, EMBER, 0.12);
};

const growth = (u: number, years: number) => (1.07 ** (years * u) - 1) / (1.07 ** years - 1);

const COINS = field(18, 5, (r) => ({ x: r(), speed: 0.03 + r() * 0.04, phase: r(), spin: r() * TAU }));

/** $10,000 compounding into a glowing curve, with a live value and rising coins. */
const moneyCurve: Scene = (ctx, w, h, t) => {
  const x0 = w * 0.12;
  const x1 = w * 0.9;
  const base = h * 0.8;
  const top = h * 0.16;
  const p = easeOut(span(t, 250, 2000));
  const point = (u: number) => [x0 + u * (x1 - x0), base - growth(u, 30) * (base - top)] as const;
  const font = Math.max(9, Math.min(w, h) * 0.034);

  ctx.strokeStyle = rgba(WHITE, 0.1);
  ctx.beginPath();
  ctx.moveTo(x0, base);
  ctx.lineTo(x1, base);
  ctx.stroke();
  [0, 10, 20, 30].forEach((year) => label(ctx, `Y${year}`, x0 + (year / 30) * (x1 - x0), base + font * 1.3, font * 0.85, rgba(WHITE, 0.35), "center"));

  if (p > 0) {
    const steps = Math.max(2, Math.floor(80 * p));
    const fill = ctx.createLinearGradient(0, top, 0, base);
    fill.addColorStop(0, rgba(EMBER, 0.38));
    fill.addColorStop(1, rgba(EMBER, 0));
    ctx.beginPath();
    ctx.moveTo(x0, base);
    for (let i = 0; i <= steps; i++) ctx.lineTo(...point((i / steps) * p));
    ctx.lineTo(point(p)[0], base);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();

    for (const [width, color] of [
      [7, rgba(EMBER, 0.2)],
      [2.2, rgba(CREAM, 0.95)],
    ] as const) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const [x, y] = point((i / steps) * p);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = width;
      ctx.strokeStyle = color;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    const [hx, hy] = point(p);
    const pulse = (t % 1300) / 1300;
    ctx.strokeStyle = rgba(EMBER, 0.6 * (1 - pulse));
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx, hy, px(5 + pulse * 22), 0, TAU);
    ctx.stroke();
    glow(ctx, hx, hy, px(16), EMBER, 0.9);
    const value = Math.round(10000 * 1.07 ** (30 * p));
    label(ctx, `$${value.toLocaleString("en-US")}`, hx - font * 0.6, hy - font * 1.4, font * 1.15, rgba(WHITE, 0.92), "right");
  }

  // Coins rising out of the growth.
  for (const coin of thin(COINS)) {
    const travel = ((t * coin.speed) / 100 + coin.phase) % 1;
    const x = x0 + coin.x * (point(p)[0] - x0);
    const y = base - travel * (base - top) * 0.9;
    const alpha = Math.sin(travel * Math.PI) * 0.55 * clamp01(p * 3);
    const squash = Math.abs(Math.cos(t * 0.004 + coin.spin));
    ctx.fillStyle = rgba(AMBER, alpha);
    ctx.beginPath();
    ctx.ellipse(x, y, font * 0.3 * (0.25 + 0.75 * squash), font * 0.3, 0, 0, TAU);
    ctx.fill();
  }
};

/** Start at 25 vs 35: two curves over 40 years, and the gap between them. */
const race: Scene = (ctx, w, h, t) => {
  const x0 = w * 0.52;
  const x1 = w * 0.93;
  const base = h * 0.6;
  const top = h * 0.14;
  const p = easeInOut(span(t, 250, 2300));
  const max = 1.07 ** 40;
  const early = (u: number) => [x0 + u * (x1 - x0), base - ((1.07 ** (40 * u) - 1) / (max - 1)) * (base - top)] as const;
  const late = (u: number) => {
    const years = Math.max(0, 40 * u - 10);
    return [x0 + u * (x1 - x0), base - ((1.07 ** years - 1) / (max - 1)) * (base - top)] as const;
  };
  const steps = Math.max(2, Math.floor(70 * p));
  const font = Math.max(8, Math.min(w, h) * 0.028);

  // Shade the difference.
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) ctx.lineTo(...early((i / steps) * p));
  for (let i = steps; i >= 0; i--) ctx.lineTo(...late((i / steps) * p));
  ctx.closePath();
  ctx.fillStyle = rgba(EMBER, 0.12);
  ctx.fill();

  for (const [curve, color, width] of [
    [late, rgba(WHITE, 0.55), 2],
    [early, rgba(EMBER, 0.95), 2.6],
  ] as const) {
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const [x, y] = curve((i / steps) * p);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  const [ex, ey] = early(p);
  const [lx, ly] = late(p);
  glow(ctx, ex, ey, px(14), EMBER, 0.9);
  glow(ctx, lx, ly, px(10), WHITE, 0.5);
  const tags = span(t, 2300, 500);
  label(ctx, "from 25", ex - px(14), ey - font * 0.9, font, rgba(EMBER, tags), "right");
  label(ctx, "from 35", lx - px(14), ly - font * 0.9, font, rgba(WHITE, tags * 0.7), "right");
};

const FLAKES = field(70, 7, (r) => ({ x: r(), y: r(), size: 0.8 + r() * 2.4, speed: 0.4 + r() * 0.9, sway: r() * TAU }));

/** Snow drifting down: it snowballs. */
const snowfall: Scene = (ctx, w, h, t) => {
  const fade = easeOut(span(t, 0, 800));
  for (const flake of thin(FLAKES)) {
    const y = ((flake.y * (h + 40) + t * flake.speed * 0.03) % (h + 40)) - 20;
    const x = flake.x * w + Math.sin(t * 0.0008 + flake.sway) * 18;
    glow(ctx, x, y, px(flake.size * 3), WHITE, 0.42 * fade * (flake.size / 3.2));
  }
};

const TRAILS = field(80, 9, (r) => ({ radius: 0.08 + r() * 1.05, angle: r() * TAU, warm: r() < 0.18, width: 0.6 + r() * 1.2 }));

/** Star trails around a pole: long exposures, time doing the work. */
const starTrails: Scene = (ctx, w, h, t) => {
  const cx = w * 0.86;
  const cy = h * 0.08;
  const R = Math.hypot(w, h) * 0.75;
  const length = 0.06 + easeOut(span(t, 0, 3200)) * 0.5;
  const turn = t * 0.00012;
  for (const trail of thin(TRAILS)) {
    const end = trail.angle + turn;
    const r = trail.radius * R;
    const color = trail.warm ? AMBER : WHITE;
    ctx.strokeStyle = rgba(color, trail.warm ? 0.3 : 0.16);
    ctx.lineWidth = trail.width;
    ctx.beginPath();
    ctx.arc(cx, cy, r, end - length, end);
    ctx.stroke();
    glow(ctx, cx + Math.cos(end) * r, cy + Math.sin(end) * r, px(3 + trail.width * 2), color, 0.55);
  }
};

/* ---------- Q4 results ---------- */

function card(ctx: Ctx, x: number, y: number, w: number, h: number, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(w, h) * 0.12);
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Floating dashboard cards: bars, a trend line and a donut, drifting in depth. */
const dashboard: Scene = (ctx, w, h, t) => {
  const s = Math.min(w, h);
  const layout = [
    { x: 0.36, y: 0.18, w: 0.36, h: 0.3, depth: 1 },
    { x: 0.62, y: 0.42, w: 0.33, h: 0.28, depth: 0.7 },
    { x: 0.3, y: 0.56, w: 0.27, h: 0.26, depth: 0.85 },
  ];
  layout.forEach((c, i) => {
    const appear = easeOut(span(t, 200 + i * 220, 700));
    const float = Math.sin(t * 0.0009 + i * 1.7) * 8 * c.depth;
    const x = c.x * w;
    const y = c.y * h + float + (1 - appear) * 24;
    const cw = c.w * w;
    const ch = c.h * h;
    card(ctx, x, y, cw, ch, appear);
    const inner = easeOut(span(t, 500 + i * 220, 1300));
    ctx.globalAlpha = appear;
    if (i === 0) {
      const values = [0.35, 0.5, 0.45, 0.68, 0.82, 1];
      const bw = (cw * 0.72) / values.length;
      values.forEach((v, b) => {
        const bh = v * ch * 0.55 * easeOut(span(t, 500 + b * 90, 700));
        ctx.fillStyle = b === values.length - 1 ? rgba(EMBER, 1) : rgba(WHITE, 0.25);
        ctx.beginPath();
        ctx.roundRect(x + cw * 0.14 + b * bw, y + ch * 0.82 - bh, bw * 0.6, bh, 2);
        ctx.fill();
      });
    } else if (i === 1) {
      ctx.beginPath();
      for (let k = 0; k <= 30; k++) {
        const u = (k / 30) * inner;
        const px = x + cw * (0.1 + 0.8 * u);
        const py = y + ch * (0.78 - 0.5 * u - Math.sin(u * 9) * 0.06);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rgba(EMBER, 1);
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      const r = Math.min(cw, ch) * 0.3;
      const cx = x + cw / 2;
      const cy = y + ch / 2;
      ctx.lineWidth = r * 0.28;
      ctx.strokeStyle = rgba(WHITE, 0.12);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = rgba(EMBER, 1);
      ctx.beginPath();
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * 0.78 * inner);
      ctx.stroke();
      label(ctx, `${Math.round(78 * inner)}%`, cx, cy, s * 0.04, rgba(WHITE, 0.9), "center");
    }
    ctx.globalAlpha = 1;
  });
};

const CANDLES = (() => {
  const r = seeded(21);
  let level = 0.08;
  return Array.from({ length: 60 }, () => {
    const open = level;
    level = Math.min(0.97, Math.max(0.03, level + (r() - 0.32) * 0.06));
    return { open, close: level, high: Math.max(open, level) + r() * 0.05, low: Math.min(open, level) - r() * 0.05 };
  });
})();

/** A market ticker scrolling across the top: the quarter's momentum. */
const ticker: Scene = (ctx, w, h, t) => {
  const bandTop = h * 0.06;
  const bandH = h * 0.36;
  const spacing = Math.max(10, w / 34);
  const offset = (t * 0.035) % spacing;
  const first = Math.floor((t * 0.035) / spacing);
  const fade = easeOut(span(t, 0, 800));
  const visible = Math.ceil(w / spacing) + 1;
  for (let i = -1; i < visible; i++) {
    // i counts from the right edge; the rightmost candle is the newest.
    const candle = CANDLES[Math.min(CANDLES.length - 1, Math.max(0, first + visible - i))];
    const x = w - (i * spacing + offset);
    const edge = Math.min(1, x / (w * 0.35)) * fade * 0.5;
    if (edge <= 0.02) continue;
    const up = candle.close >= candle.open;
    const y = (v: number) => bandTop + (1 - v) * bandH;
    ctx.strokeStyle = rgba(up ? EMBER : WHITE, edge * 0.8);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y(candle.high));
    ctx.lineTo(x, y(candle.low));
    ctx.stroke();
    ctx.fillStyle = rgba(up ? EMBER : WHITE, edge * (up ? 0.9 : 0.45));
    const bodyTop = y(Math.max(candle.open, candle.close));
    ctx.fillRect(x - spacing * 0.25, bodyTop, spacing * 0.5, Math.max(1.5, Math.abs(y(candle.open) - y(candle.close))));
  }
};

const SPARKS = field(46, 13, (r) => ({ x: r(), speed: 0.4 + r() * 0.8, phase: r(), size: 1 + r() * 2.5, sway: r() * TAU }));

/** Sparks rising from the bottom right: growth pushing upward. */
const sparksRise: Scene = (ctx, w, h, t) => {
  ctx.globalCompositeOperation = "lighter";
  for (const spark of thin(SPARKS)) {
    const travel = ((t * spark.speed) / 2600 + spark.phase) % 1;
    const x = w * (0.45 + spark.x * 0.55) + Math.sin(t * 0.002 + spark.sway) * 10;
    const y = h * (1.02 - travel * 0.95);
    const alpha = Math.sin(travel * Math.PI) * 0.7;
    glow(ctx, x, y, px(spark.size * 4), travel > 0.5 ? AMBER : EMBER, alpha);
  }
  ctx.globalCompositeOperation = "source-over";
};

const BLIPS = field(40, 17, (r, i) => ({ angle: r() * TAU, radius: 0.2 + r() * 0.75, churned: i % 17 === 5 }));

/** A radar sweep over customers: nearly every blip stays lit. */
const radar: Scene = (ctx, w, h, t) => {
  const cx = w * 0.8;
  const cy = h * 0.56;
  const R = Math.min(w, h) * 0.46;
  const appear = easeOut(span(t, 0, 700));
  ctx.globalAlpha = appear;
  ctx.lineWidth = 1;
  for (const k of [0.25, 0.5, 0.75, 1]) {
    ctx.strokeStyle = rgba(WHITE, 0.07);
    ctx.beginPath();
    ctx.arc(cx, cy, R * k, 0, TAU);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(cx - R, cy);
  ctx.lineTo(cx + R, cy);
  ctx.moveTo(cx, cy - R);
  ctx.lineTo(cx, cy + R);
  ctx.stroke();

  const sweep = t * 0.0024;
  const cone = ctx.createConicGradient(sweep - 0.9, cx, cy);
  cone.addColorStop(0, rgba(EMBER, 0));
  cone.addColorStop(0.143, rgba(EMBER, 0.28));
  cone.addColorStop(0.144, rgba(EMBER, 0));
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fill();

  for (const blip of BLIPS) {
    const since = (((sweep - blip.angle) % TAU) + TAU) % TAU;
    const lit = Math.max(0.25, 1 - since / TAU);
    const x = cx + Math.cos(blip.angle) * blip.radius * R;
    const y = cy + Math.sin(blip.angle) * blip.radius * R;
    glow(ctx, x, y, px(7), blip.churned ? WHITE : EMBER, (blip.churned ? 0.3 : 0.9) * lit);
  }
  ctx.globalAlpha = 1;
};

const NODES = (() => {
  const r = seeded(29);
  const nodes = Array.from({ length: 44 }, () => ({ x: 0.3 + r() * 0.68, y: 0.12 + r() * 0.72 }));
  // Link each node to its nearest two earlier nodes.
  const links = nodes.flatMap((node, i) =>
    nodes
      .slice(0, i)
      .map((other, j) => ({ j, d: Math.hypot(node.x - other.x, node.y - other.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .map(({ j }) => [i, j] as const),
  );
  return { nodes, links };
})();

/** A network of customers that keeps growing month over month. */
const network: Scene = (ctx, w, h, t) => {
  const appearAt = (i: number) => 150 + i * 62;
  ctx.lineWidth = 1;
  for (const [a, b] of NODES.links) {
    const shown = span(t, appearAt(a), 400);
    if (shown <= 0) continue;
    const A = NODES.nodes[a];
    const B = NODES.nodes[b];
    ctx.strokeStyle = rgba(WHITE, 0.08 * shown);
    ctx.beginPath();
    ctx.moveTo(A.x * w, A.y * h);
    ctx.lineTo(mix(A.x, B.x, shown) * w, mix(A.y, B.y, shown) * h);
    ctx.stroke();
    // A pulse travelling along the link.
    const k = ((t / 1400 + a * 0.13) % 1) * shown;
    glow(ctx, mix(A.x, B.x, k) * w, mix(A.y, B.y, k) * h, px(4), AMBER, 0.3 * shown);
  }
  NODES.nodes.forEach((node, i) => {
    const shown = easeOut(span(t, appearAt(i), 400));
    glow(ctx, node.x * w, node.y * h, px(3 + 5 * shown), i % 5 === 0 ? EMBER : WHITE, 0.5 * shown);
  });
};

/* ---------- Black holes ---------- */

const WARP = field(170, 31, (r) => ({ x: r() * 2 - 1, y: r() * 2 - 1, z: r(), speed: 0.5 + r() * 0.8, warm: r() < 0.2 }));

/** Stars streaking past as we fall toward the subject. */
const warp: Scene = (ctx, w, h, t) => {
  const cx = w * 0.78;
  const cy = h * 0.5;
  const focal = Math.max(w, h) * 0.38;
  const speed = 0.00018 + easeIn(span(t, 0, 3000)) * 0.00035;
  glow(ctx, cx, cy, Math.min(w, h) * 0.3, EMBER, 0.14);
  ctx.lineCap = "round";
  for (const star of thin(WARP)) {
    const z = 1 - ((star.z + t * speed * star.speed) % 1);
    const zTail = Math.min(1, z + 0.03 + speed * 120);
    const px = cx + (star.x / z) * focal * 0.2;
    const py = cy + (star.y / z) * focal * 0.2;
    const tx = cx + (star.x / zTail) * focal * 0.2;
    const ty = cy + (star.y / zTail) * focal * 0.2;
    const alpha = clamp01((1 - z) * 1.4) * 0.6;
    ctx.strokeStyle = rgba(star.warm ? AMBER : WHITE, alpha);
    ctx.lineWidth = Math.max(0.6, (1 - z) * 2.2);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(px, py);
    ctx.stroke();
  }
};

const GRAIN = field(70, 37, (r) => ({ angle: r() * TAU, radius: Math.sqrt(r()) * 0.9, speed: 0.2 + r() * 0.5, size: 0.08 + r() * 0.12 }));

function plasmaStar(ctx: Ctx, x: number, y: number, r: number, t: number, hot: RGB, rim: RGB) {
  // Corona rays.
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * TAU + t * 0.00008;
    const len = r * (1.25 + 0.25 * Math.sin(t * 0.002 + i * 2.1));
    ctx.strokeStyle = rgba(rim, 0.07);
    ctx.lineWidth = r * 0.06;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }
  glow(ctx, x, y, r * 2.4, rim, 0.35);
  ctx.globalCompositeOperation = "source-over";
  const body = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, r * 0.1, x, y, r);
  body.addColorStop(0, rgba([255, 250, 240], 1));
  body.addColorStop(0.45, rgba(hot, 1));
  body.addColorStop(1, rgba(rim, 1));
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  // Boiling surface.
  ctx.globalCompositeOperation = "lighter";
  for (const g of thin(GRAIN)) {
    const a = g.angle + t * 0.0003 * g.speed;
    glow(ctx, x + Math.cos(a) * g.radius * r * 0.85, y + Math.sin(a) * g.radius * r * 0.85, g.size * r, [255, 240, 210], 0.18);
  }
  ctx.globalCompositeOperation = "source-over";
}

/** The Sun next to a massive star. */
const stars: Scene = (ctx, w, h, t) => {
  starfield(ctx, w, h, t, 0.6);
  const s = Math.min(w, h);
  const grow = easeOut(span(t, 200, 1600));
  const font = Math.max(8, s * 0.034);
  plasmaStar(ctx, w * 0.78, h * 0.47, s * 0.3 * (0.4 + 0.6 * grow), t, [255, 196, 140], EMBER);
  plasmaStar(ctx, w * 0.47, h * 0.72, s * 0.045, t, [255, 238, 200], AMBER);
  const tags = span(t, 1500, 500);
  label(ctx, "Sun", w * 0.47, h * 0.72 + s * 0.1, font, rgba(WHITE, 0.7 * tags), "center");
  label(ctx, "Massive star", w * 0.78, h * 0.47 + s * 0.38, font, rgba(WHITE, 0.7 * tags), "center");
};

const DISK = field(360, 41, (r) => ({ angle: r() * TAU, radius: 1.3 + r() ** 1.5 * 2.4, size: 0.5 + r() * 1.3 }));

/**
 * A black hole in the style of the famous renders: a hot, almost edge-on
 * accretion disk crosses in front of the shadow, while gravity bends the
 * disk's far side into a ring over the top and under the bottom. The side
 * turning toward us burns brighter.
 */
const gargantua: Scene = (ctx, w, h, t) => {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const R = Math.min(w * 0.12, h * 0.19);
  const tilt = 0.16;
  const appear = easeOut(span(t, 0, 1000));
  const spin = t * 0.00045;
  starfield(ctx, w, h, t, appear * 0.9);

  // One half of the disk as stacked elliptical bands, hot inside to ember outside.
  const diskHalf = (front: boolean) => {
    ctx.globalCompositeOperation = "lighter";
    const bands = 22;
    for (let i = 0; i < bands; i++) {
      const k = i / (bands - 1);
      const radius = R * (1.3 + k * 2.4);
      const heat = 1 - k;
      const color = mixRGB(EMBER, CREAM, heat ** 1.4);
      // Doppler beaming: brighter on the left, where matter swings toward us.
      const beam = ctx.createLinearGradient(cx - radius, 0, cx + radius, 0);
      const base = (0.05 + heat * 0.16) * appear;
      beam.addColorStop(0, rgba(color, base * 1.9));
      beam.addColorStop(0.5, rgba(color, base));
      beam.addColorStop(1, rgba(color, base * 0.45));
      ctx.strokeStyle = beam;
      ctx.lineWidth = R * 0.13;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * tilt, 0, front ? 0 : Math.PI, front ? Math.PI : TAU);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  };

  // Streaks of matter riding the disk.
  const matter = (front: boolean) => {
    ctx.globalCompositeOperation = "lighter";
    for (const p of thin(DISK)) {
      const angle = p.angle + spin / p.radius ** 1.5;
      const sin = Math.sin(angle);
      if (sin > 0 !== front) continue;
      const x = cx + Math.cos(angle) * p.radius * R;
      const y = cy + sin * p.radius * R * tilt;
      const heat = clamp01(1.5 - p.radius * 0.5);
      const beam = 0.5 + 0.5 * Math.max(0, -Math.cos(angle) * 0.6 + 0.4);
      glow(ctx, x, y, (0.6 + heat * 1.6) * (R / 40), mixRGB(EMBER, CREAM, heat), 0.5 * beam * appear);
    }
    ctx.globalCompositeOperation = "source-over";
  };

  // Soft halo around the whole system.
  glow(ctx, cx, cy, R * 4.2, EMBER, 0.16 * appear);

  diskHalf(false);
  matter(false);

  // The far side of the disk, lensed over the top and (fainter) under the bottom.
  ctx.globalCompositeOperation = "lighter";
  for (const [radius, width, alpha, from, to] of [
    [1.5, 0.42, 0.14, Math.PI, TAU],
    [1.4, 0.2, 0.34, Math.PI, TAU],
    [1.33, 0.07, 0.8, Math.PI, TAU],
    [1.22, 0.1, 0.2, 0, Math.PI],
  ] as const) {
    const ring = ctx.createLinearGradient(cx - R * radius, 0, cx + R * radius, 0);
    ring.addColorStop(0, rgba(CREAM, alpha * appear));
    ring.addColorStop(0.55, rgba(AMBER, alpha * 0.85 * appear));
    ring.addColorStop(1, rgba(EMBER, alpha * 0.5 * appear));
    ctx.strokeStyle = ring;
    ctx.lineWidth = R * width;
    ctx.beginPath();
    ctx.arc(cx, cy, R * radius, from, to);
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";

  // The shadow, with a razor-thin photon ring hugging it.
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rgba(CREAM, 0.9 * appear);
  ctx.lineWidth = Math.max(1, R * 0.03);
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.03, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = rgba(AMBER, 0.25 * appear);
  ctx.lineWidth = R * 0.1;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.08, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";

  // Near side of the disk sweeps across in front of the shadow.
  diskHalf(true);
  matter(true);
};

const DEBRIS = field(60, 43, (r) => ({ angle: r() * TAU, speed: 0.4 + r() * 0.8, size: 1 + r() * 2 }));

/** A star burns out, swells, collapses in a supernova and leaves a black hole. */
const collapse: Scene = (ctx, w, h, t) => {
  const x = w * 0.8;
  const y = h * 0.34;
  const R = Math.min(w, h) * 0.13;
  starfield(ctx, w, h, t, 0.5);
  const burnout = span(t, 770, 540);
  const fall = span(t, 1310, 380);
  const bang = span(t, 1600, 900);
  const hole = span(t, 1850, 600);

  if (fall < 1) {
    const radius = R * (1 + 0.35 * easeOut(burnout)) * (1 - 0.85 * easeIn(fall));
    const hot = mixRGB([255, 236, 200], [255, 120, 60], burnout);
    const rim = mixRGB(AMBER, [200, 50, 20], burnout);
    plasmaStar(ctx, x, y, radius * (1 + 0.02 * Math.sin(t * 0.02)), t, hot, rim);
  }
  if (bang > 0 && bang < 1) {
    ctx.globalCompositeOperation = "lighter";
    glow(ctx, x, y, R * (1 + bang * 3), CREAM, (1 - bang) * 0.9);
    ctx.strokeStyle = rgba(AMBER, (1 - bang) * 0.8);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, R * (0.4 + bang * 3.4), 0, TAU);
    ctx.stroke();
    for (const d of thin(DEBRIS)) {
      const dist = R * (0.3 + bang * 3.2 * d.speed);
      glow(ctx, x + Math.cos(d.angle) * dist, y + Math.sin(d.angle) * dist, px(d.size * 3), EMBER, (1 - bang) * 0.8);
    }
    ctx.globalCompositeOperation = "source-over";
  }
  if (hole > 0) {
    const r = R * 0.34 * easeOut(hole);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = rgba(AMBER, 0.6 * hole);
    ctx.lineWidth = r * 0.35;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 2.4, r * 0.5, 0, 0, TAU);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = rgba(CREAM, 0.85 * hole);
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
};

/** Spacetime as a grid, sinking deeper as the core shrinks; a body orbits the well. */
const gravityWell: Scene = (ctx, w, h, t) => {
  const cx = w * 0.72;
  const cy = h * 0.42;
  const s = Math.min(w, h) * 0.08;
  const depth = 0.4 + easeInOut(span(t, 200, 2800)) * 1.8;
  const lines = 12;
  const project = (X: number, Z: number) => {
    const d = -depth / (Math.hypot(X, Z) * 0.9 + 0.5);
    return [cx + (X - Z) * s * 0.95, cy + (X + Z) * s * 0.42 - d * s] as const;
  };
  const fade = easeOut(span(t, 0, 700));
  ctx.lineWidth = 1;
  for (let i = -lines / 2; i <= lines / 2; i++) {
    for (const axis of [0, 1]) {
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) {
        const v = -lines / 2 + (k / 40) * lines;
        const [px, py] = axis === 0 ? project(i, v) : project(v, i);
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      const near = 1 - Math.abs(i) / (lines / 2);
      ctx.strokeStyle = rgba(mixRGB(WHITE, EMBER, near * 0.7), (0.06 + near * 0.12) * fade);
      ctx.stroke();
    }
  }
  const [bx, by] = project(0, 0);
  glow(ctx, bx, by, s * 1.4, EMBER, 0.5 * fade);
  // An orbiting body with a short trail.
  for (let k = 0; k < 14; k++) {
    const a = t * 0.0022 - k * 0.07;
    const [ox, oy] = project(Math.cos(a) * 2.2, Math.sin(a) * 2.2);
    glow(ctx, ox, oy, px(k === 0 ? 9 : 5), k === 0 ? CREAM : AMBER, (k === 0 ? 0.95 : 0.4 * (1 - k / 14)) * fade);
  }
};

/* ---------- Product launch ---------- */

function drawRocket(ctx: Ctx, x: number, y: number, size: number, angle = 0, flame = 1, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const u = size / 10;
  // Exhaust flame, flickering.
  if (flame > 0) {
    const len = u * (5 + 2.2 * Math.sin(t * 0.05) + 1.2 * Math.sin(t * 0.13)) * flame;
    const g = ctx.createLinearGradient(0, u * 3.4, 0, u * 3.4 + len);
    g.addColorStop(0, "rgba(255,245,220,0.95)");
    g.addColorStop(0.35, rgba(AMBER, 0.85));
    g.addColorStop(1, rgba(EMBER, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-u * 1.1, u * 3.3);
    ctx.quadraticCurveTo(0, u * 3.3 + len * 1.1, u * 1.1, u * 3.3);
    ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    glow(ctx, 0, u * 4.2, u * 4 * flame, EMBER, 0.6);
    ctx.globalCompositeOperation = "source-over";
  }
  // Fins.
  ctx.fillStyle = rgba(EMBER, 1);
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * u * 1.2, u * 0.8);
    ctx.lineTo(side * u * 2.6, u * 3.4);
    ctx.lineTo(side * u * 1.1, u * 2.9);
    ctx.closePath();
    ctx.fill();
  }
  // Body.
  const body = ctx.createLinearGradient(-u * 1.3, 0, u * 1.3, 0);
  body.addColorStop(0, "#9a9aa0");
  body.addColorStop(0.45, "#f4f4f1");
  body.addColorStop(1, "#8a8a90");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -u * 5);
  ctx.bezierCurveTo(u * 1.7, -u * 3, u * 1.35, u * 1.5, u * 1.1, u * 3.3);
  ctx.lineTo(-u * 1.1, u * 3.3);
  ctx.bezierCurveTo(-u * 1.35, u * 1.5, -u * 1.7, -u * 3, 0, -u * 5);
  ctx.fill();
  // Window.
  ctx.fillStyle = "#0b0b0c";
  ctx.beginPath();
  ctx.arc(0, -u * 1.3, u * 0.62, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(EMBER, 1);
  ctx.lineWidth = u * 0.22;
  ctx.stroke();
  ctx.restore();
}

const PUFFS = field(34, 47, (r) => ({ spread: r() * 2 - 1, speed: 0.5 + r() * 0.8, phase: r(), size: 0.6 + r() * 0.8 }));
const STREAKS = field(40, 53, (r) => ({ x: r(), phase: r(), length: 0.04 + r() * 0.1 }));

/** A rocket climbing, trailing smoke, with stars streaking past. */
const rocket: Scene = (ctx, w, h, t) => {
  const size = Math.min(w, h) * 0.36;
  const rise = easeInOut(span(t, 200, 3400));
  const x = w * 0.66 + Math.sin(t * 0.003) * 2;
  const y = h * 0.62 - rise * h * 0.12;
  const speed = 0.4 + rise;
  // Streaks rushing down past the rocket.
  ctx.lineCap = "round";
  for (const s of STREAKS) {
    const py = ((s.phase + (t / 1000) * speed * 0.6) % 1) * h * 1.2 - h * 0.1;
    ctx.strokeStyle = rgba(WHITE, 0.18);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * (0.3 + s.x * 0.7), py);
    ctx.lineTo(w * (0.3 + s.x * 0.7), py - s.length * h * speed);
    ctx.stroke();
  }
  // Smoke trail.
  for (const puff of thin(PUFFS)) {
    const age = ((t / 1600) * puff.speed + puff.phase) % 1;
    const px = x + puff.spread * age * size * 0.35;
    const py = y + size * 0.36 + age * h * 0.5;
    glow(ctx, px, py, size * (0.08 + age * 0.3) * puff.size, [150, 150, 158], 0.28 * (1 - age));
  }
  drawRocket(ctx, x, y, size, 0, 1, t);
};

const CONFETTI = field(56, 59, (r) => ({ x: r(), phase: r(), speed: 0.5 + r() * 0.8, spin: (r() - 0.5) * 0.01, color: [EMBER, AMBER, WHITE][Math.floor(r() * 3)], shape: r() < 0.5 }));

/** Launch-day confetti, falling slowly. */
const confetti: Scene = (ctx, w, h, t) => {
  const fade = easeOut(span(t, 0, 600));
  for (const c of thin(CONFETTI)) {
    const y = ((c.phase + (t / 5200) * c.speed) % 1) * (h * 1.1) - h * 0.05;
    const x = c.x * w + Math.sin(t * 0.0015 + c.phase * 9) * 16;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * c.spin);
    ctx.fillStyle = rgba(c.color as RGB, 0.55 * fade);
    const size = Math.max(3, Math.min(w, h) * 0.014);
    if (c.shape) ctx.fillRect(-size / 2, -size, size, size * 2);
    else {
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.6, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
};

/** A launch trajectory arcing up, with a small rocket riding it. */
const trajectory: Scene = (ctx, w, h, t) => {
  starfield(ctx, w, h, t, 0.5);
  const p0 = [w * 0.04, h * 0.95] as const;
  const c = [w * 0.97, h * 0.97] as const;
  const p1 = [w * 0.97, h * 0.06] as const;
  const at = (u: number) => [
    (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0],
    (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1],
  ] as const;
  const p = easeInOut(span(t, 300, 2600));
  ctx.setLineDash([3, 7]);
  ctx.strokeStyle = rgba(WHITE, 0.18);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(...p0);
  ctx.quadraticCurveTo(c[0], c[1], p1[0], p1[1]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = rgba(EMBER, 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let k = 0; k <= 50; k++) {
    const [x, y] = at((k / 50) * p);
    if (k === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const [x, y] = at(p);
  const [nx, ny] = at(Math.min(1, p + 0.01));
  drawRocket(ctx, x, y, Math.min(w, h) * 0.07, Math.atan2(ny - y, nx - x) + Math.PI / 2, 0.8, t);
};

function gear(ctx: Ctx, x: number, y: number, r: number, teeth: number, angle: number, stroke: string, fill: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * TAU;
    const rr = i % 2 === 0 ? r : r * 0.84;
    const a2 = a + TAU / (teeth * 2);
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    ctx.lineTo(Math.cos(a2) * rr, Math.sin(a2) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.2;
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.28, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/** Interlocking gears: the launch machine running. */
const gears: Scene = (ctx, w, h, t) => {
  const s = Math.min(w, h);
  const spin = t * 0.0006;
  const fade = easeOut(span(t, 0, 700));
  ctx.globalAlpha = fade * 0.8;
  const gx = w * 0.9;
  const gy = h * 0.8;
  gear(ctx, gx, gy, s * 0.26, 14, spin, rgba(WHITE, 0.18), "rgba(255,255,255,0.025)");
  gear(ctx, gx - s * 0.41, gy - s * 0.2, s * 0.16, 9, -spin * (14 / 9) + 0.2, rgba(EMBER, 0.55), rgba(EMBER, 0.06));
  gear(ctx, gx + s * 0.04, gy - s * 0.42, s * 0.11, 7, -spin * 2, rgba(WHITE, 0.14), "rgba(255,255,255,0.02)");
  ctx.globalAlpha = 1;
};

const BILLOWS = field(28, 61, (r) => ({ side: r() < 0.5 ? -1 : 1, speed: 0.5 + r(), phase: r(), size: 0.7 + r() * 0.8 }));

/** Countdown to launch: ignition, smoke, and liftoff. */
const liftoff: Scene = (ctx, w, h, t) => {
  const size = Math.min(w, h) * 0.34;
  const ground = h * 0.86;
  const ignite = span(t, 900, 450);
  const climb = span(t, 1450, 1900) ** 2.2;
  const shake = ignite > 0 && climb < 0.05 ? Math.sin(t * 0.09) * 1.5 : 0;
  const x = w * 0.72 + shake;
  const y = ground - size * 0.42 - climb * h * 1.1;

  // Launch tower.
  ctx.strokeStyle = rgba(WHITE, 0.2);
  ctx.lineWidth = 1;
  const towerX = w * 0.72 - size * 0.42;
  ctx.beginPath();
  for (let k = 0; k < 7; k++) {
    const ty = ground - (k / 6) * size * 0.95;
    ctx.moveTo(towerX, ty);
    ctx.lineTo(towerX + size * 0.1, ty - size * 0.08);
  }
  ctx.moveTo(towerX, ground);
  ctx.lineTo(towerX, ground - size);
  ctx.moveTo(towerX + size * 0.1, ground);
  ctx.lineTo(towerX + size * 0.1, ground - size);
  ctx.stroke();
  ctx.strokeStyle = rgba(WHITE, 0.14);
  ctx.beginPath();
  ctx.moveTo(w * 0.35, ground);
  ctx.lineTo(w * 0.98, ground);
  ctx.stroke();

  // Smoke billowing out along the ground after ignition.
  if (ignite > 0) {
    for (const b of thin(BILLOWS)) {
      const age = (((t - 900) / 1500) * b.speed + b.phase) % 1;
      const px = w * 0.72 + b.side * age * w * 0.3;
      const py = ground - age * size * 0.25;
      glow(ctx, px, py, size * (0.12 + age * 0.35) * b.size, [170, 170, 176], 0.35 * (1 - age) * ignite);
    }
  }
  drawRocket(ctx, x, y, size, 0, ignite * (1 + climb), t);
  const text = t < 1450 ? `T-${Math.max(1, 3 - Math.floor(t / 480))}` : "Liftoff";
  label(ctx, text, w * 0.72, h * 0.12, Math.max(10, Math.min(w, h) * 0.05), rgba(t < 1450 ? WHITE : EMBER, 0.85), "center");
};

const scenes: Record<SceneName, Scene> = {
  spiral,
  moneyCurve,
  race,
  snowfall,
  starTrails,
  dashboard,
  ticker,
  sparksRise,
  radar,
  network,
  warp,
  stars,
  gargantua,
  collapse,
  gravityWell,
  rocket,
  confetti,
  trajectory,
  gears,
  liftoff,
};

export const SCENES = Object.fromEntries(
  Object.entries(scenes).map(([name, scene]) => [
    name,
    ((ctx, w, h, t) => {
      S = Math.min(w, h) / 460;
      STEP = w * h < 160_000 ? 2 : 1;
      scene(ctx, w, h, t);
    }) as Scene,
  ]),
) as Record<SceneName, Scene>;
