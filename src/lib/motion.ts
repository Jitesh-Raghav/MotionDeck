import { cubicBezier } from "motion/react";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const ease = cubicBezier(...EASE);

/** Seconds */
export const DURATION = 0.7;
export const STAGGER = 0.07;

export const revealTransition = { duration: DURATION, ease: EASE };
