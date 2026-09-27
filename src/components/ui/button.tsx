import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "light";
type Size = "md" | "sm";

/*
 * Buttons are `isolate`, so the hover overlays sit at z-index -1: above the
 * button's own background, below its label. Only opacity and transform animate.
 */
const base =
  "group relative isolate inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-transform duration-150 ease-brand active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 " +
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 " +
  "after:pointer-events-none after:absolute after:inset-0 after:-z-10 after:rounded-[inherit] after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100";

const variants: Record<Variant, string> = {
  // Hover darkens slightly and a soft ember glow appears inside.
  primary: "bg-[#1c1c1f] text-bg before:bg-black/60 after:shadow-[inset_0_0_18px_rgba(255,90,31,0.4)]",
  secondary: "bg-surface text-ink border border-hairline-strong before:bg-ink/[0.05]",
  light: "bg-stage-ink text-ink before:bg-ink/[0.08] after:shadow-[inset_0_0_18px_rgba(255,90,31,0.3)]",
};

const sizes: Record<Size, string> = {
  md: "h-12 px-6 text-[15px]",
  sm: "h-10 px-4 text-[15px]",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

/** A slow ember light beam travelling around the button's border. */
export function Beam() {
  return <span aria-hidden="true" className="beam" />;
}

/** Arrow that slides 4px right when its button is hovered. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(
        "relative size-4 transition-transform duration-200 ease-brand group-hover:translate-x-1",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
