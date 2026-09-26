import type { BarDatum } from "@/components/anim/BarChart";
import type { Milestone } from "@/components/anim/TimelineDraw";
import { DECADES, END_VALUE, MILESTONES, START_VALUE, usd, valueAfter } from "@/lib/compound";
import type { BackdropKind, Feature, Kpi, VersusSide } from "./graphics";

/*
 * Pre-scripted example decks for the landing page. These are hand-written,
 * not generated live, which is why the hero labels them "Try an example".
 * The numbers in the business decks are sample content.
 */

type Base = { eyebrow: string; backdrop?: BackdropKind };

export type SlideSpec = Base &
  (
    | { kind: "title"; title: string; serif: string; subtitle: string; tags?: string[] }
    | {
        kind: "stat";
        from: number;
        to: number;
        format: (value: number) => string;
        label: string;
        spark?: number[];
      }
    | { kind: "bars"; title: string; serif: string; bars: BarDatum[]; highlight: number; callout?: string }
    | { kind: "line"; title: string; serif: string; values: number[]; caption: string; callout?: string }
    | { kind: "timeline"; title: string; serif: string; milestones: Milestone[]; highlight: number }
    | { kind: "list"; title: string; serif: string; items: string[] }
    | {
        kind: "versus";
        title: string;
        serif: string;
        left: VersusSide;
        right: VersusSide;
        format: (value: number) => string;
      }
    | { kind: "ring"; title: string; serif: string; value: number; label: string }
    | { kind: "kpis"; title: string; serif: string; items: Kpi[] }
    | { kind: "features"; title: string; serif: string; items: Feature[] }
    | { kind: "blackhole"; title: string; serif: string }
  );

export type Deck = {
  id: string;
  /** Label on the example chip. */
  chip: string;
  /** What gets typed into the prompt bar. */
  prompt: string;
  /** Shown in the window's title bar. */
  title: string;
  slides: SlideSpec[];
};

const millions = (thousands: number) => `$${(thousands / 1000).toFixed(1)}M`;
const count = (value: number) => value.toLocaleString("en-US");
const percent = (value: number) => `${value}%`;

// $10,000 at 7%, every 5 years, scaled 0–1.
const GROWTH_CURVE = [0, 0.06, 0.15, 0.27, 0.43, 0.67, 1];

export const DECKS: Deck[] = [
  {
    id: "compound",
    chip: "Compound interest",
    prompt: "Explain how compound interest works",
    title: "How compound interest works",
    slides: [
      {
        kind: "title",
        eyebrow: "Explainer · 5 slides",
        title: "How compound interest works",
        serif: "compound",
        subtitle: "Small, steady growth, on repeat.",
        tags: ["Personal finance", "Beginner"],
        backdrop: "orb",
      },
      {
        kind: "stat",
        eyebrow: `What ${usd.format(START_VALUE)} becomes`,
        from: START_VALUE,
        to: END_VALUE,
        format: usd.format,
        label: "7% a year, 30 years",
        spark: GROWTH_CURVE,
        backdrop: "rings",
      },
      {
        kind: "versus",
        eyebrow: "Start early",
        title: "Ten years makes the difference.",
        serif: "difference.",
        left: { label: "Start at 35", value: valueAfter(30), caption: "30 years of growth" },
        right: { label: "Start at 25", value: valueAfter(40), caption: "40 years of growth" },
        format: usd.format,
        backdrop: "grid",
      },
      {
        kind: "bars",
        eyebrow: "Growth by decade",
        title: "It snowballs.",
        serif: "snowballs.",
        bars: DECADES,
        highlight: DECADES.length - 1,
        callout: "7.6× in 30 years",
        backdrop: "dots",
      },
      {
        kind: "timeline",
        eyebrow: "The long game",
        title: "Time does the heavy lifting.",
        serif: "lifting.",
        milestones: MILESTONES,
        highlight: MILESTONES.length - 1,
        backdrop: "grid",
      },
    ],
  },
  {
    id: "q4",
    chip: "Q4 results",
    prompt: "Summarize our Q4 results",
    title: "Q4 results",
    slides: [
      {
        kind: "title",
        eyebrow: "Quarterly review",
        title: "Q4 results",
        serif: "results",
        subtitle: "Where we landed, and what comes next.",
        tags: ["Board update", "FY 2026"],
        backdrop: "orb",
      },
      {
        kind: "kpis",
        eyebrow: "At a glance",
        title: "A record quarter.",
        serif: "record",
        items: [
          { label: "Revenue", from: 1200, to: 2400, format: millions, delta: "+100%", spark: [0, 0.2, 0.45, 1] },
          { label: "Customers", from: 0, to: 1840, format: count, delta: "+62%", spark: [0, 0.3, 0.55, 0.7, 1] },
          { label: "Margin", from: 0, to: 78, format: percent, delta: "+6 pts", spark: [0.4, 0.5, 0.45, 0.7, 1] },
        ],
      },
      {
        kind: "bars",
        eyebrow: "Revenue by quarter",
        title: "Doubled in a year.",
        serif: "Doubled",
        bars: [
          { label: "Q1", value: 1.2, display: "$1.2M" },
          { label: "Q2", value: 1.5, display: "$1.5M" },
          { label: "Q3", value: 1.9, display: "$1.9M" },
          { label: "Q4", value: 2.4, display: "$2.4M" },
        ],
        highlight: 3,
        callout: "+100% since Q1",
        backdrop: "dots",
      },
      {
        kind: "ring",
        eyebrow: "Retention",
        title: "Customers stayed.",
        serif: "stayed.",
        value: 94,
        label: "renewed their plan this quarter",
        backdrop: "rings",
      },
      {
        kind: "line",
        eyebrow: "Active customers",
        title: "Every month, more.",
        serif: "more.",
        values: [0.12, 0.2, 0.26, 0.34, 0.4, 0.49, 0.56, 0.63, 0.72, 0.8, 0.9, 1],
        caption: "Monthly active customers, January to December.",
        callout: "Up every month",
        backdrop: "grid",
      },
    ],
  },
  {
    id: "black-holes",
    chip: "How black holes form",
    prompt: "How do black holes form?",
    title: "How black holes form",
    slides: [
      {
        kind: "title",
        eyebrow: "Science explainer",
        title: "How black holes form",
        serif: "form",
        subtitle: "From a giant star to a point of no return.",
        tags: ["Astrophysics", "Explainer"],
        backdrop: "orb",
      },
      {
        kind: "stat",
        eyebrow: "How big the star must be",
        from: 1,
        to: 20,
        format: (value) => `${value}×`,
        label: "the Sun's mass, roughly",
        backdrop: "rings",
      },
      {
        kind: "blackhole",
        eyebrow: "Anatomy",
        title: "Where light gets trapped.",
        serif: "trapped.",
      },
      {
        kind: "timeline",
        eyebrow: "The life cycle",
        title: "A star's last chapter.",
        serif: "last",
        milestones: [
          { label: "Step 1", value: "Burnout", caption: "Fusion stops" },
          { label: "Step 2", value: "Collapse", caption: "The core falls in" },
          { label: "Step 3", value: "Black hole", caption: "Not even light escapes" },
        ],
        highlight: 2,
        backdrop: "grid",
      },
      {
        kind: "line",
        eyebrow: "Gravity at the surface",
        title: "Smaller core, stronger pull.",
        serif: "stronger",
        values: [0.02, 0.03, 0.05, 0.08, 0.13, 0.22, 0.4, 0.7, 1],
        caption: "Squeeze the same mass smaller and surface gravity climbs.",
        callout: "g ∝ 1/r²",
        backdrop: "dots",
      },
    ],
  },
  {
    id: "launch",
    chip: "Product launch",
    prompt: "Plan our product launch",
    title: "Product launch plan",
    slides: [
      {
        kind: "title",
        eyebrow: "Launch plan",
        title: "Our product launch",
        serif: "launch",
        subtitle: "Six weeks from beta to launch day.",
        tags: ["Go-to-market", "6 weeks"],
        backdrop: "orb",
      },
      {
        kind: "features",
        eyebrow: "What's new",
        title: "Three things users asked for.",
        serif: "asked",
        items: [
          { icon: "bolt", title: "Faster exports", body: "Renders finish sooner." },
          { icon: "palette", title: "Custom themes", body: "Your fonts and colors." },
          { icon: "link", title: "One-click sharing", body: "Send a link, not a file." },
        ],
        backdrop: "grid",
      },
      {
        kind: "timeline",
        eyebrow: "The plan",
        title: "Six weeks, three milestones.",
        serif: "three",
        milestones: [
          { label: "Week 1", value: "Beta", caption: "Invite testers" },
          { label: "Week 4", value: "Waitlist", caption: "Open signups" },
          { label: "Week 6", value: "Launch", caption: "Go live" },
        ],
        highlight: 2,
        backdrop: "dots",
      },
      {
        kind: "ring",
        eyebrow: "Launch checklist",
        title: "Almost there.",
        serif: "there.",
        value: 80,
        label: "of launch tasks done",
        backdrop: "rings",
      },
      {
        kind: "stat",
        eyebrow: "Countdown",
        from: 0,
        to: 42,
        format: (value) => String(value),
        label: "days to launch",
        backdrop: "orb",
      },
    ],
  },
];
