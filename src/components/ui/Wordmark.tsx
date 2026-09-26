import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn("shrink-0", className ?? "size-5")}>
      <rect x="6" y="3" width="12" height="9" rx="2" fill="currentColor" opacity="0.22" />
      <rect x="2" y="8" width="12" height="9" rx="2" fill="currentColor" />
      <rect x="5" y="13" width="4" height="1.6" rx="0.8" fill="var(--accent)" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-[17px] font-medium tracking-[-0.02em]">Motiondeck</span>
    </span>
  );
}
