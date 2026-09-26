"use client";

import { useEffect, useRef } from "react";
import { useInView } from "motion/react";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Seconds */
  delay?: number;
  as?: "div" | "li";
};

/**
 * Fades content in with a 16px rise the first time 15% of it is on screen.
 * The hidden state lives in CSS under `.js`, so content is visible without
 * JS, and the safety script in the layout can force it visible.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  useEffect(() => {
    document.documentElement.setAttribute("data-reveal-ready", "");
  }, []);

  const Component = as;
  return (
    <Component
      ref={ref}
      data-reveal=""
      data-shown={inView ? "" : undefined}
      className={className}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </Component>
  );
}
