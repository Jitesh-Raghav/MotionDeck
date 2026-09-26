import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  // 1280px of content plus the side gutters.
  return (
    <div className={cn("mx-auto w-full max-w-[1344px] px-5 sm:px-8", className)}>{children}</div>
  );
}

const sectionPadding = "py-20 md:py-24 lg:py-32";

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

/** Full-bleed dark section with rounded top corners and a soft spotlight. */
export function StageSection({
  id,
  labelledBy,
  className,
  spotlight = "top",
  children,
}: {
  id?: string;
  labelledBy?: string;
  className?: string;
  spotlight?: "top" | "center";
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "on-dark slide-dark relative isolate overflow-hidden rounded-t-stage bg-stage text-stage-ink",
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

/** Every section opens the same way: mono eyebrow, big H2, one-line subhead. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  subhead,
  align = "left",
  tone = "light",
  className,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
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
      <Reveal delay={0.07}>
        <h2 id={id} className="mt-5 text-h2 text-balance">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={0.14}>
        <p className={cn("mt-5 max-w-[560px] text-body text-pretty", muted)}>{subhead}</p>
      </Reveal>
      {children}
    </div>
  );
}
