"use client";

import { useRef, useState } from "react";
import { m, useInView, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/cn";
import { DescribeScene, ExportScene, RefineScene } from "./StoryScenes";
import { StoryWindow } from "./StoryWindow";

const STEPS = [
  {
    title: "Describe",
    body: "Type a topic or paste your notes. Pick a format and a theme.",
    window: "Untitled deck",
    Scene: DescribeScene,
  },
  {
    title: "Refine",
    body: "Review the outline. Reorder, cut, or rewrite before anything is generated.",
    window: "How compound interest works",
    Scene: RefineScene,
  },
  {
    title: "Present or export",
    body: "Go fullscreen and record, or download an MP4 ready to post.",
    window: "How compound interest works",
    Scene: ExportScene,
  },
];

const number = (index: number) => String(index + 1).padStart(2, "0");

/**
 * One list of steps for every screen size. On desktop the steps scroll past
 * a pinned product window; on smaller screens each step shows its own window
 * inline. The windows are decorative (aria-hidden), so screen readers hear
 * each step once.
 */
export function HowItWorksStory() {
  const stepsRef = useRef<HTMLOListElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(windowRef, { amount: 0.3 });
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start center", "end center"] });
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(progress * STEPS.length))));
  });

  return (
    <div className="mt-12 lg:mt-4 lg:grid lg:grid-cols-12 lg:gap-8">
      <ol ref={stepsRef} className="relative flex flex-col gap-16 lg:col-span-5 lg:gap-0">
        {/* Progress line: a hairline track with an ink fill (desktop). */}
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-[5px] hidden w-px bg-hairline-strong lg:block" />
        <m.span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[5px] hidden w-px origin-top bg-ink lg:block"
          style={{ scaleY: scrollYProgress }}
        />
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            aria-current={index === active ? "step" : undefined}
            className="relative lg:flex lg:min-h-[52vh] lg:items-center lg:pl-12"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 hidden size-[11px] rounded-full border-2 transition-transform duration-300 ease-brand lg:block",
                index === active ? "scale-125 border-accent bg-accent" : "border-hairline-strong bg-bg",
              )}
            />
            <div className={cn("max-w-[420px] transition-colors duration-300", index !== active && "lg:text-muted")}>
              <p className="font-mono text-[12px] tracking-[0.1em] text-muted">{number(index)}</p>
              <h3 className="mt-3 text-[28px] leading-[1.1] font-medium tracking-[-0.03em] lg:text-[32px]">
                {step.title}
              </h3>
              <p className={cn("mt-3 text-body text-muted", index === active && "lg:text-ink")}>{step.body}</p>
            </div>
            <InlineWindow step={step} />
          </li>
        ))}
      </ol>

      <div className="hidden lg:col-span-7 lg:block">
        <div className="sticky top-0 flex h-screen items-center">
          <div ref={windowRef} className="w-full">
            <StoryWindow title={STEPS[active].window}>
              <div className="relative aspect-[5/4]">
                {STEPS.map(({ title, Scene }, index) => (
                  <div
                    key={title}
                    className={cn(
                      "absolute inset-0 flex flex-col justify-center p-8 transition-opacity duration-500 ease-brand",
                      index === active ? "opacity-100" : "pointer-events-none opacity-0",
                    )}
                  >
                    <Scene playing={onScreen && index === active} />
                  </div>
                ))}
              </div>
            </StoryWindow>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Smaller screens: the step's own window, playing while it's on screen. */
function InlineWindow({ step }: { step: (typeof STEPS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, { amount: 0.3 });
  const { Scene } = step;
  return (
    <div ref={ref} className="mt-8 lg:hidden">
      <StoryWindow title={step.window}>
        <div className="p-5">
          <Scene playing={onScreen} />
        </div>
      </StoryWindow>
    </div>
  );
}
