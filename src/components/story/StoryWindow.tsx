"use client";

import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/ui/Wordmark";

/** Dark product window chrome shared by the story scenes. */
export function StoryWindow({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "on-dark slide-dark relative overflow-hidden rounded-window bg-stage-2 text-left shadow-window ring-1 ring-white/[0.07]",
        className,
      )}
    >
      <div className="flex h-11 items-center gap-3 border-b border-stage-line px-4">
        <span className="flex items-center gap-1.5">
          {[0, 1, 2].map((dot) => (
            <span key={dot} className="size-2.5 rounded-full bg-white/[0.12]" />
          ))}
        </span>
        <LogoMark className="ml-2 size-4 text-stage-ink" />
        <span className="text-[13px] text-stage-muted">{title}</span>
      </div>
      {children}
    </div>
  );
}
