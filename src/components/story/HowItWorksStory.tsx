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

/** Desktop: the steps scroll past a pinned window. Mobile: a plain stack. */
export function HowItWorksStory() {
  return (
    <>
      <PinnedStory />
      <ol className="mt-14 flex flex-col gap-16 lg:hidden">
        {STEPS.map((step, index) => (
          <MobileStep key={step.title} index={index} step={step} />
        ))}
      </ol>
    </>
  );
}

function PinnedStory() {
  const stepsRef = useRef<HTMLOListElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const onScreen = useInView(windowRef, { amount: 0.3 });
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start center", "end center"] });
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(progress * STEPS.length))));
  });

  return (
    <div className="mt-8 hidden grid-cols-12 gap-8 lg:grid">
      <ol ref={stepsRef} className="relative col-span-5">
        {/* Progress line: a hairline track with an ink fill. */}
        <span aria-hidden="true" className="absolute top-0 bottom-0 left-[5px] w-px bg-hairline-strong" />
        <m.span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[5px] w-px origin-top bg-ink"
          style={{ scaleY: scrollYProgress }}
        />
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            aria-current={index === active ? "step" : undefined}
            className="relative flex min-h-[62vh] items-center pl-12"
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-0 size-[11px] rounded-full border-2 transition-transform duration-300 ease-brand",
                index === active ? "scale-125 border-accent bg-accent" : "border-hairline-strong bg-bg",
              )}
            />
            <div className={cn("max-w-[420px]", index === active ? "text-ink" : "text-muted")}>
              <p className="font-mono text-[12px] tracking-[0.1em]">{number(index)}</p>
              <h3 className="mt-3 text-[32px] leading-[1.1] font-medium tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-3 text-body">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="col-span-7">
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

function MobileStep({ index, step }: { index: number; step: (typeof STEPS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, { amount: 0.3 });
  const { Scene } = step;
  return (
    <li>
      <p className="font-mono text-[12px] tracking-[0.1em] text-muted">{number(index)}</p>
      <h3 className="mt-3 text-[28px] leading-[1.1] font-medium tracking-[-0.03em]">{step.title}</h3>
      <p className="mt-3 text-body text-muted">{step.body}</p>
      <div ref={ref} className="mt-8">
        <StoryWindow title={step.window}>
          <div className="p-5">
            <Scene playing={onScreen} />
          </div>
        </StoryWindow>
      </div>
    </li>
  );
}
