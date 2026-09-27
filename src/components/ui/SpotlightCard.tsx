"use client";

import { cn } from "@/lib/cn";

/**
 * A card with a soft radial spotlight that follows the cursor on hover.
 * The light is a CSS gradient positioned from two custom properties, so only
 * its opacity animates.
 */
export function SpotlightCard({
  className,
  spot = "rgba(255,255,255,0.07)",
  children,
}: {
  className?: string;
  /** Colour at the centre of the spotlight. */
  spot?: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={cn("group relative", className)}
      style={{ "--spot": spot } as React.CSSProperties}
      onPointerMove={(event) => {
        const card = event.currentTarget;
        const box = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - box.left}px`);
        card.style.setProperty("--my", `${event.clientY - box.top}px`);
      }}
    >
      <span aria-hidden="true" className="spotlight" />
      {children}
    </article>
  );
}
