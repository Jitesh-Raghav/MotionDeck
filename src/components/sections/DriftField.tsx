"use client";

import { useRef } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/cn";

type Fragment = {
  className: string;
  /** Drift offset, duration and tilt fed to the CSS keyframes. */
  style: Record<string, string>;
  children: React.ReactNode;
};

const fragments: Fragment[] = [
  {
    className: "top-[3%] left-[-14%] w-[170px] md:top-[12%] md:left-[4%] md:w-[200px]",
    style: { "--dx": "14px", "--dy": "-20px", "--t": "17s", "--r": "-6deg" },
    children: (
      <div className="flex h-[92px] items-end gap-2 px-4 pb-4">
        {[30, 44, 62, 88].map((h, i) => (
          <span key={h} className={cn("flex-1 rounded-sm", i === 3 ? "bg-accent" : "bg-white/40")} style={{ height: `${h}%` }} />
        ))}
      </div>
    ),
  },
  {
    className: "top-[18%] right-[5%] hidden w-[230px] md:block",
    style: { "--dx": "-16px", "--dy": "18px", "--t": "19s", "--r": "5deg" },
    children: <p className="px-5 py-5 text-[40px] leading-none font-medium tracking-[-0.04em] text-white">$76,123</p>,
  },
  {
    className: "bottom-[16%] left-[8%] hidden w-[250px] md:block",
    style: { "--dx": "18px", "--dy": "14px", "--t": "21s", "--r": "4deg" },
    children: (
      <div className="relative px-5 py-7">
        <span className="absolute inset-x-5 top-1/2 h-px bg-white/40" />
        <div className="relative flex justify-between">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn("size-3 rounded-full", i === 2 ? "bg-accent" : "bg-white/70")} />
          ))}
        </div>
      </div>
    ),
  },
  {
    className: "right-[-16%] bottom-[10%] w-[230px] md:right-[9%] md:bottom-[12%] md:w-[260px]",
    style: { "--dx": "-12px", "--dy": "-16px", "--t": "18s", "--r": "-4deg" },
    children: (
      <p className="px-5 py-5 text-[26px] leading-tight font-medium tracking-[-0.03em] text-white">
        How black holes <em className="serif-accent">form</em>
      </p>
    ),
  },
  {
    className: "top-[48%] left-[-2%] hidden w-[180px] lg:block",
    style: { "--dx": "10px", "--dy": "22px", "--t": "23s", "--r": "8deg" },
    children: (
      <svg viewBox="0 0 180 90" className="block w-full p-4" fill="none" aria-hidden="true">
        <path d="M4 80 C 40 70, 60 60, 90 44 S 150 12, 176 6" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    className: "top-[46%] right-[-1%] hidden w-[190px] lg:block",
    style: { "--dx": "-14px", "--dy": "-18px", "--t": "20s", "--r": "-7deg" },
    children: (
      <div className="px-5 py-5">
        <p className="font-mono text-[12px] tracking-[0.1em] text-white/60 uppercase">Chapter 02</p>
        <p className="mt-1 text-[22px] font-medium tracking-[-0.03em] text-white">Going deeper</p>
      </div>
    ),
  },
];

/** Faint slide fragments drifting behind the final call to action. */
export function DriftField() {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, { amount: 0.1 });
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-playing={onScreen ? "" : undefined}
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {fragments.map((fragment, index) => (
        <div
          key={index}
          className={cn("drift absolute rounded-2xl border border-white/10 bg-white/[0.03] opacity-[0.22]", fragment.className)}
          style={fragment.style as React.CSSProperties}
        >
          {fragment.children}
        </div>
      ))}
    </div>
  );
}
