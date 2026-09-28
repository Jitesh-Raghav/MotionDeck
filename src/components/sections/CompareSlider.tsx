"use client";

import { useRef, useState } from "react";
import { m, useMotionValue } from "motion/react";
import { BarChart } from "@/components/anim/BarChart";
import { CountUp } from "@/components/anim/CountUp";
import { TypeReveal } from "@/components/anim/TypeReveal";
import { useLoopClock, useLoopFade, useOnScreen, useSpan, type Clock } from "@/components/anim/clock";
import { trackOnce } from "@/lib/analytics/events";
import { cn } from "@/lib/cn";

const LOOP = 5600;

const QUARTERS = [
  { label: "Q1", value: 1.2, display: "$1.2M" },
  { label: "Q2", value: 1.5, display: "$1.5M" },
  { label: "Q3", value: 1.9, display: "$1.9M" },
  { label: "Q4", value: 2.4, display: "$2.4M" },
];

const millions = (thousands: number) => `$${(thousands / 1000).toFixed(1)}M`;

/**
 * One slide shown twice: flat and static on the left, animated and looping
 * on the right. Drag the handle, or focus it and use the arrow keys.
 */
export function CompareSlider() {
  const [position, setPosition] = useState(50);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const { ref: screenRef, onScreen } = useOnScreen<HTMLDivElement>();
  const clock = useLoopClock(LOOP, onScreen);
  const still = useMotionValue(1_000_000);

  function moveTo(clientX: number) {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    setPosition(Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100)));
  }

  function onKeyDown(event: React.KeyboardEvent) {
    const step = event.shiftKey ? 10 : 4;
    const keys: Record<string, number> = {
      ArrowLeft: position - step,
      ArrowDown: position - step,
      ArrowRight: position + step,
      ArrowUp: position + step,
      Home: 0,
      End: 100,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    trackOnce("motion_slider_used", {});
    setPosition(Math.min(100, Math.max(0, keys[event.key])));
  }

  return (
    <div ref={screenRef}>
      <div
        ref={boxRef}
        className="relative aspect-[4/3] cursor-ew-resize touch-pan-y overflow-hidden rounded-card bg-surface shadow-window ring-1 ring-hairline select-none sm:aspect-[16/10]"
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          moveTo(event.clientX);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          trackOnce("motion_slider_used", {});
          moveTo(event.clientX);
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* Right: the animated version. */}
        <div className="slide-light absolute inset-0" aria-hidden="true">
          <ComparisonSlide clock={clock} animated />
        </div>
        {/* Left: the same slide, flat and still, clipped to the handle. */}
        <div
          className="slide-light absolute inset-0 bg-surface grayscale"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden="true"
        >
          <ComparisonSlide clock={still} />
        </div>

        <span className="eyebrow pointer-events-none absolute top-4 left-4 rounded-full bg-bg/90 px-2.5 py-1.5 text-muted ring-1 ring-hairline">
          Static
        </span>
        <span className="eyebrow pointer-events-none absolute top-4 right-4 flex items-center gap-2 rounded-full bg-bg/90 px-2.5 py-1.5 text-ink ring-1 ring-hairline">
          <span aria-hidden="true" className="live-dot" />
          Motion
        </span>

        <div className="absolute inset-y-0 w-0" style={{ left: `${position}%` }}>
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink/80" />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare the static and animated slide"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            aria-valuetext={`${Math.round(position)}% static`}
            onKeyDown={onKeyDown}
            className="absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-bg shadow-lift"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M8 6l-4 4 4 4M12 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-[15px] text-muted">
        Drag the handle, or use the arrow keys.
      </p>
    </div>
  );
}

/** Two columns: the claim and the number on the left, the chart on the right. */
function ComparisonSlide({ clock, animated = false }: { clock: Clock; animated?: boolean }) {
  const fade = useLoopFade(clock, LOOP);
  const caption = useSpan(clock, 1100, 600);
  const eyebrow = useSpan(clock, 0, 500);
  return (
    <m.div
      className="slide-root absolute inset-0"
      style={animated ? { opacity: fade } : undefined}
    >
      <div className="slide-inner absolute inset-0 grid grid-cols-[1fr_1.05fr] items-center gap-[calc(var(--u)*4)] px-[calc(var(--u)*6)] text-left">
        <div>
          <m.p
            className="font-mono text-[max(9px,calc(var(--u)*1.4))] tracking-[0.1em] text-muted uppercase"
            style={{ opacity: eyebrow }}
          >
            Q4 update
          </m.p>
          <p
            className={cn(
              "mt-[calc(var(--u)*1.4)] text-[calc(var(--u)*4.4)] leading-[1.06] font-medium tracking-[-0.035em] text-ink",
            )}
          >
            <TypeReveal clock={clock} text="Revenue doubled this year" start={100} serifWords={["doubled"]} />
          </p>
          <p className="mt-[calc(var(--u)*3)] text-[calc(var(--u)*8)] leading-none font-medium tracking-[-0.045em] text-ink">
            <CountUp clock={clock} from={1200} to={2400} format={millions} start={500} duration={1500} />
          </p>
          <m.p
            className="mt-[calc(var(--u)*1.6)] text-[max(10px,calc(var(--u)*1.8))] text-muted"
            style={{ opacity: caption }}
          >
            Q4 revenue, up from $1.2M in Q1
          </m.p>
        </div>
        <BarChart clock={clock} bars={QUARTERS} start={600} stagger={260} highlight={3} className="w-full" />
      </div>
    </m.div>
  );
}
