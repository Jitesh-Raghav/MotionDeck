"use client";

import { m, useMotionValue, useTransform } from "motion/react";
import { BarChart } from "@/components/anim/BarChart";
import { CountUp } from "@/components/anim/CountUp";
import { LineDraw } from "@/components/anim/LineDraw";
import { StaggerList } from "@/components/anim/StaggerList";
import { TimelineDraw, TimelineVertical } from "@/components/anim/TimelineDraw";
import { TypeReveal } from "@/components/anim/TypeReveal";
import { useSpan, type Clock } from "@/components/anim/clock";
import { cn } from "@/lib/cn";
import type { SlideSpec } from "./decks";
import {
  Backdrop,
  Callout,
  FeatureCards,
  KpiTiles,
  Spark,
  Tags,
  TickRing,
  Versus,
} from "./graphics";
import { SceneCanvas } from "./SceneCanvas";
import { SLIDE_MS } from "./timing";

/*
 * One slide, at any aspect ratio. Sizes use --u (see .slide-root in
 * globals.css), which grows for square and tall frames, so the same slide
 * reads at 16:9, 1:1 and 9:16. Every animation is scheduled from `start` on
 * the clock.
 */

type SlideViewProps = { slide: SlideSpec; clock: Clock; start: number; className?: string };

export function SlideView({ slide, clock, start, className }: SlideViewProps) {
  return (
    <div className={cn("slide-root absolute inset-0", className)}>
      <div className="slide-inner absolute inset-0 overflow-hidden">
        <Backdrop kind={slide.backdrop ?? "none"} clock={clock} start={start} length={SLIDE_MS} />
        {slide.scene && (
          <SceneCanvas
            scene={slide.scene.name}
            clock={clock}
            start={start}
            className={cn("h-full w-full", slide.scene.place === "right" ? "scene-right" : "scene-full")}
          />
        )}
        <div className="absolute inset-0 flex flex-col px-[calc(var(--u)*7)] py-[calc(var(--u)*6)] text-left">
          <SlideBody slide={slide} clock={clock} start={start} />
        </div>
      </div>
    </div>
  );
}

/** A slide frozen on its final frame, for thumbnails and static comparisons. */
export function SlideStill({ slide, className }: { slide: SlideSpec; className?: string }) {
  const clock = useMotionValue(1_000_000);
  return <SlideView slide={slide} clock={clock} start={1_000_000 - SLIDE_MS + 600} className={className} />;
}

function SlideBody({ slide, clock, start }: { slide: SlideSpec; clock: Clock; start: number }) {
  switch (slide.kind) {
    case "title":
      return (
        <div className={cn("my-auto", slide.scene?.place === "right" && "scene-text")}>
          <Rule clock={clock} at={start + 150} />
          <Eyebrow clock={clock} at={start + 100}>
            {slide.eyebrow}
          </Eyebrow>
          <p className="mt-[calc(var(--u)*1.6)] text-[calc(var(--u)*6.4)] leading-[1.04] font-medium tracking-[-0.035em] text-[var(--s-ink)]">
            <TypeReveal clock={clock} text={slide.title} start={start + 250} serifWords={[slide.serif]} />
          </p>
          <Fade clock={clock} at={start + 1000}>
            <p className="mt-[calc(var(--u)*2.2)] text-[calc(var(--u)*2.2)] text-[var(--s-muted)]">
              {slide.subtitle}
            </p>
          </Fade>
          {slide.tags && <Tags clock={clock} at={start + 1300} tags={slide.tags} />}
        </div>
      );
    case "stat":
      return (
        <>
          <div className={cn("my-auto", slide.scene?.place === "right" && "scene-text")}>
            <Eyebrow clock={clock} at={start + 150}>
              {slide.eyebrow}
            </Eyebrow>
            <p className="mt-[calc(var(--u)*1.4)] text-[calc(var(--u)*11)] leading-none font-medium tracking-[-0.045em] text-[var(--s-ink)]">
              <CountUp
                clock={clock}
                from={slide.from}
                to={slide.to}
                format={slide.format}
                start={start + 300}
                duration={1700}
              />
            </p>
            <Fade clock={clock} at={start + 500}>
              <p className="mt-[calc(var(--u)*2.4)] flex items-center gap-[calc(var(--u)*1.2)] text-[calc(var(--u)*2.4)] text-[var(--s-muted)]">
                <span className="size-[calc(var(--u)*1)] shrink-0 rounded-full bg-accent" />
                {slide.label}
              </p>
            </Fade>
          </div>
          {slide.spark && <Spark clock={clock} at={start + 500} values={slide.spark} />}
        </>
      );
    case "bars":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          {slide.callout && (
            <Callout clock={clock} at={start + 1900}>
              {slide.callout}
            </Callout>
          )}
          <ChartArea>
            <BarChart
              clock={clock}
              bars={slide.bars}
              start={start + 350}
              stagger={300}
              highlight={slide.highlight}
              className="slide-wide-only h-full w-auto max-w-full"
            />
            <BarChart
              clock={clock}
              bars={slide.bars}
              start={start + 350}
              stagger={300}
              highlight={slide.highlight}
              tall
              className="slide-tall-only h-full w-auto max-w-full"
            />
          </ChartArea>
        </>
      );
    case "line":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          {slide.callout && (
            <Callout clock={clock} at={start + 1700}>
              {slide.callout}
            </Callout>
          )}
          <ChartArea>
            <LineDraw
              clock={clock}
              values={slide.values}
              start={start + 350}
              duration={1500}
              className="slide-wide-only h-full w-auto max-w-full"
            />
            <LineDraw
              clock={clock}
              values={slide.values}
              start={start + 350}
              duration={1500}
              tall
              className="slide-tall-only h-full w-auto max-w-full"
            />
          </ChartArea>
          <Fade clock={clock} at={start + 1600}>
            <p className="mt-[calc(var(--u)*1.6)] text-[max(7px,calc(var(--u)*1.8))] text-[var(--s-muted)]">
              {slide.caption}
            </p>
          </Fade>
        </>
      );
    case "timeline":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          <ChartArea>
            <TimelineDraw
              clock={clock}
              milestones={slide.milestones}
              start={start + 350}
              segment={420}
              hold={120}
              highlight={slide.highlight}
              className="slide-wide-only h-full w-auto max-w-full"
            />
            <TimelineVertical
              clock={clock}
              milestones={slide.milestones}
              start={start + 350}
              segment={420}
              hold={120}
              highlight={slide.highlight}
              className="slide-tall-only w-full"
            />
          </ChartArea>
        </>
      );
    case "list":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          <div className="mt-auto">
            <StaggerList
              clock={clock}
              items={slide.items}
              start={start + 400}
              stagger={180}
              className="text-[calc(var(--u)*2.6)]"
            />
          </div>
        </>
      );
    case "versus":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          <Versus clock={clock} start={start} left={slide.left} right={slide.right} format={slide.format} />
        </>
      );
    case "ring":
      return (
        <div className="slide-stack my-auto grid grid-cols-[auto_1fr] items-center gap-[calc(var(--u)*5)]">
          <div className="flex h-[calc(var(--u)*32)] justify-center">
            <TickRing clock={clock} start={start} value={slide.value} />
          </div>
          <div>
            <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
            <Fade clock={clock} at={start + 1500}>
              <p className="mt-[calc(var(--u)*2)] flex items-center gap-[calc(var(--u)*1.2)] text-[calc(var(--u)*2.2)] text-[var(--s-muted)]">
                <span className="size-[calc(var(--u)*1)] shrink-0 rounded-full bg-accent" />
                {slide.value}% {slide.label}
              </p>
            </Fade>
          </div>
        </div>
      );
    case "kpis":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          <KpiTiles clock={clock} start={start} items={slide.items} />
        </>
      );
    case "features":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          <FeatureCards clock={clock} start={start} items={slide.items} />
        </>
      );
    case "blackhole":
      return (
        <>
          <Heading clock={clock} start={start} eyebrow={slide.eyebrow} title={slide.title} serif={slide.serif} />
          <div className="relative mt-[calc(var(--u)*2)] min-h-0 flex-1">
            <SceneCanvas
              scene="gargantua"
              clock={clock}
              start={start}
              className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_closest-side,black_62%,transparent)]"
            />
            <PartLabel clock={clock} at={start + 1300} className="top-[14%] left-[8%]">
              Photon ring
            </PartLabel>
            <PartLabel clock={clock} at={start + 1550} className="top-[42%] left-[4%]">
              Event horizon
            </PartLabel>
            <PartLabel clock={clock} at={start + 1800} className="right-[4%] bottom-[16%]">
              Accretion disk
            </PartLabel>
          </div>
        </>
      );
  }
}

/** A small label naming part of a diagram. */
function PartLabel({
  clock,
  at,
  className,
  children,
}: {
  clock: Clock;
  at: number;
  className: string;
  children: React.ReactNode;
}) {
  const opacity = useSpan(clock, at, 500);
  const x = useTransform(opacity, [0, 1], [-6, 0]);
  return (
    <m.span
      className={cn(
        "absolute flex items-center gap-[calc(var(--u)*0.8)] font-mono text-[max(7px,calc(var(--u)*1.35))] tracking-[0.08em] text-[var(--s-muted)] uppercase",
        className,
      )}
      style={{ opacity, x }}
    >
      <span className="size-[calc(var(--u)*0.7)] rounded-full bg-accent" />
      {children}
    </m.span>
  );
}

function ChartArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-[calc(var(--u)*3)] flex min-h-0 flex-1 items-end justify-center">{children}</div>
  );
}

function Heading({
  clock,
  start,
  eyebrow,
  title,
  serif,
}: {
  clock: Clock;
  start: number;
  eyebrow: string;
  title: string;
  serif: string;
}) {
  return (
    <div>
      <Eyebrow clock={clock} at={start + 100}>
        {eyebrow}
      </Eyebrow>
      <Fade clock={clock} at={start + 150}>
        <p className="mt-[calc(var(--u)*1.2)] text-[calc(var(--u)*3.8)] leading-[1.08] font-medium tracking-[-0.03em] text-[var(--s-ink)]">
          {title.split(" ").map((word, index, words) => (
            <span key={index} className={word === serif ? "serif-accent" : undefined}>
              {word}
              {index < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </Fade>
    </div>
  );
}

function Eyebrow({ clock, at, children }: { clock: Clock; at: number; children: React.ReactNode }) {
  const opacity = useSpan(clock, at, 500);
  return (
    <m.p
      className="font-mono text-[max(7px,calc(var(--u)*1.35))] tracking-[0.1em] text-[var(--s-muted)] uppercase"
      style={{ opacity }}
    >
      {children}
    </m.p>
  );
}

function Fade({ clock, at, children }: { clock: Clock; at: number; children: React.ReactNode }) {
  const opacity = useSpan(clock, at, 600);
  const y = useTransform(opacity, [0, 1], [6, 0]);
  return <m.div style={{ opacity, y }}>{children}</m.div>;
}

function Rule({ clock, at }: { clock: Clock; at: number }) {
  const scaleX = useSpan(clock, at, 700);
  return (
    <m.span
      className="mb-[calc(var(--u)*2.4)] block h-[calc(var(--u)*0.35)] w-[calc(var(--u)*7)] bg-accent"
      style={{ scaleX, originX: 0 }}
    />
  );
}
