"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ease } from "@/lib/motion";

/**
 * Every animation primitive reads a "clock": a MotionValue holding
 * milliseconds. Pausing a clock freezes everything that reads it.
 */
export type Clock = MotionValue<number>;

/** 0 → 1 over [start, start + duration] ms of the clock, eased. */
export function useSpan(clock: Clock, start: number, duration: number) {
  return useTransform(clock, [start, start + duration], [0, 1], { clamp: true, ease });
}

/** Longest step a clock takes in one frame, so a stalled tab never skips ahead. */
const MAX_STEP = 250;

/**
 * A clock that loops from 0 to `total` while `playing`. With reduced motion
 * it never runs and holds `settled` (a fully built frame) instead.
 */
export function useLoopClock(total: number, playing: boolean, settled = total - 700): Clock {
  const clock = useMotionValue(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) clock.set(settled);
  }, [clock, reduce, settled]);

  useAnimationFrame((_, delta) => {
    if (!playing || reduce) return;
    clock.set((clock.get() + Math.min(delta, MAX_STEP)) % total);
  });

  return clock;
}

/**
 * True once the element comes within `margin` of the viewport, and stays
 * true. Heavy decorative content below the fold mounts only then, which keeps
 * the first load's DOM (and hydration) small.
 */
export function useNear<T extends Element>(margin = "800px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [margin]);
  return { ref, near };
}

/**
 * `onScreen` for running a loop, plus `near`: true once the element comes
 * within 800px of the viewport, so heavy visuals can mount only then.
 */
export function useNearOnScreen<T extends Element>(amount = 0.15) {
  const ref = useRef<T>(null);
  const onScreen = useInView(ref, { amount });
  const near = useInView(ref, { margin: "800px", once: true });
  return { ref, onScreen, near };
}

/** Loop only while at least a sliver of the element is on screen. */
export function useOnScreen<T extends Element>(amount = 0.15) {
  const ref = useRef<T>(null);
  const onScreen = useInView(ref, { amount });
  return { ref, onScreen };
}

/** Fades a looping scene in at the start and out before it restarts. */
export function useLoopFade(clock: Clock, total: number) {
  return useTransform(clock, [0, 250, total - 450, total], [0, 1, 1, 0]);
}

export function svgId(reactId: string) {
  return reactId.replace(/[^a-zA-Z0-9_-]/g, "");
}
