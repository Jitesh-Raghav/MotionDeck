"use client";

import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { revealTransition } from "@/lib/motion";

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={revealTransition}>
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
