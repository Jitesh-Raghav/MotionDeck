"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/cn";

type MaskHeadingProps = {
  as?: "h1" | "h2";
  id?: string;
  text: string;
  /** The one word set in Instrument Serif italic, with an ember underline. */
  serif?: string;
  className?: string;
};

/**
 * A heading whose lines slide up from behind a clip, 60ms apart, followed by
 * a hand-drawn ember underline under the serif word. The final state is the
 * server HTML; the hidden state only applies under `.js` (see globals.css),
 * and the layout's safety script can force it visible.
 */
export function MaskHeading({ as: Tag = "h2", id, text, serif, className }: MaskHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  const [lines, setLines] = useState<number[]>([]);
  const words = text.split(" ");

  // Work out which line each word landed on, so lines (not words) stagger.
  useLayoutEffect(() => {
    const heading = ref.current;
    if (!heading) return;
    const measure = () => {
      const tops = [...heading.querySelectorAll<HTMLElement>(".mask-word")].map((word) => word.offsetTop);
      const distinct = [...new Set(tops)].sort((a, b) => a - b);
      const next = tops.map((top) => distinct.indexOf(top));
      setLines((previous) => (previous.join() === next.join() ? previous : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(heading);
    document.documentElement.setAttribute("data-reveal-ready", "");
    return () => observer.disconnect();
  }, [text]);

  return (
    <Tag
      ref={ref}
      id={id}
      data-reveal=""
      data-mask=""
      data-shown={inView ? "" : undefined}
      className={cn("text-balance", className)}
    >
      {words.map((word, index) => {
        const bare = word.replace(/[.,!?]+$/, "");
        const tail = word.slice(bare.length);
        const style = { "--line": lines[index] ?? 0 } as React.CSSProperties;
        return (
          <span key={index}>
            <span className="mask-word" style={style}>
              <span>
                {serif && bare === serif ? (
                  <>
                    <span className="relative inline-block">
                      <em className="serif-accent">{bare}</em>
                      <Underline />
                    </span>
                    {tail}
                  </>
                ) : (
                  word
                )}
              </span>
            </span>
            {index < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </Tag>
  );
}

function Underline() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 12"
      preserveAspectRatio="none"
      className="mask-underline pointer-events-none absolute right-[4%] -bottom-[0.02em] left-[2%] h-[0.2em] overflow-visible"
    >
      <path
        d="M2 8 C 18 3, 40 10, 58 6 S 88 3, 98 7"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
