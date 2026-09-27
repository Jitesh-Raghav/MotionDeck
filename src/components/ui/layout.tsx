import { cn } from "@/lib/cn";
import { MaskHeading } from "./MaskHeading";
import { PixelEdge } from "./PixelEdge";
import { Reveal } from "./Reveal";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // 1200px of content plus the side gutters.
  return (
    <div className={cn("mx-auto w-full max-w-[1264px] px-5 sm:px-8", className)}>{children}</div>
  );
}

export const sectionPadding = "py-[clamp(72px,9vw,120px)]";

export function Section({
  id,
  labelledBy,
  className,
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(sectionPadding, className)}>
      {children}
    </section>
  );
}

/**
 * Full-bleed dark section with a soft spotlight. Where it meets the light page
 * a pixel-dither edge dissolves in, above and below.
 */
export function StageSection({
  id,
  labelledBy,
  className,
  spotlight = "top",
  edges = "both",
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  spotlight?: "top" | "center";
  edges?: "both" | "top";
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10">
      <PixelEdge side="top" className="absolute inset-x-0 bottom-full" />
      <section
        id={id}
        aria-labelledby={labelledBy}
        className={cn(
          "on-dark slide-dark relative isolate overflow-hidden bg-stage text-stage-ink",
          sectionPadding,
          className,
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1/2 -z-10 -translate-x-1/2 rounded-full",
            spotlight === "top"
              ? "-top-[30%] h-[80%] w-[110%] bg-[radial-gradient(closest-side,rgba(255,90,31,0.16),rgba(255,90,31,0.04)_55%,transparent)]"
              : "top-1/2 h-[90%] w-[90%] -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,90,31,0.2),rgba(255,90,31,0.05)_55%,transparent)]",
          )}
        />
        {children}
      </section>
      {edges === "both" && <PixelEdge side="bottom" className="absolute inset-x-0 top-full" />}
    </div>
  );
}

export function Eyebrow({
  className,
  live = false,
  children,
  ...rest
}: {
  className?: string;
  live?: boolean;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("eyebrow flex items-center gap-2.5", className)} {...rest}>
      {live && <span aria-hidden="true" className="live-dot" />}
      {children}
    </p>
  );
}

/** Instrument Serif italic for the one accent word in a headline. */
export function Serif({ children }: { children: React.ReactNode }) {
  return <em className="serif-accent">{children}</em>;
}

/**
 * Every section opens the same way: mono eyebrow, big H2 (one serif word),
 * one-line subhead. Spacing: 14px, 16px, then 48px to the content.
 */
export function SectionHeader({
  id,
  eyebrow,
  title,
  serif,
  subhead,
  align = "left",
  tone = "light",
  className,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  serif: string;
  subhead: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
  children?: React.ReactNode;
}) {
  const muted = tone === "dark" ? "text-stage-muted" : "text-muted";
  return (
    <div
      className={cn(
        "flex max-w-[760px] flex-col",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      <Reveal>
        <Eyebrow className={muted}>{eyebrow}</Eyebrow>
      </Reveal>
      <MaskHeading id={id} text={title} serif={serif} className="mt-3.5 text-h2" />
      <Reveal delay={0.14}>
        <p className={cn("mt-4 max-w-[560px] text-body text-pretty", muted)}>{subhead}</p>
      </Reveal>
      {children}
    </div>
  );
}
