import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "light";
type Size = "md" | "sm";

const base =
  "group relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-[opacity,transform] duration-150 ease-brand active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 " +
  // Hover tint as an overlay so only opacity animates.
  "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0 before:transition-opacity before:duration-150 hover:before:opacity-100";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg before:bg-white/12",
  secondary: "bg-surface text-ink border border-hairline-strong before:bg-ink/[0.04]",
  light: "bg-stage-ink text-ink before:bg-ink/[0.06]",
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

/** Arrow that slides 3px right when its button is hovered. */
export function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(
        "relative size-4 transition-transform duration-150 ease-brand group-hover:translate-x-[3px]",
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
