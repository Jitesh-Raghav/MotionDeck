"use client";

import { useEffect, useState } from "react";
import { Arrow, Beam, buttonClasses } from "@/components/ui/button";
import { JumpToForm } from "@/components/ui/JumpToForm";
import { Wordmark } from "@/components/ui/Wordmark";
import { cn } from "@/lib/cn";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#animations", label: "Animations" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

/** Floating pill, 12px from the top. Its backdrop fades in once the page scrolls. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3">
      <div className="relative flex h-14 w-full max-w-[960px] items-center justify-between gap-4 rounded-full pr-2 pl-5">
        {/* Only opacity animates: the blurred backdrop is its own layer. */}
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-full border border-hairline bg-bg/75 shadow-[0_8px_24px_-12px_rgba(11,11,12,0.18)] backdrop-blur-xl transition-opacity duration-300 ease-brand",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
        <a href="#top" aria-label="Motiondeck home" className="relative rounded-full">
          <Wordmark />
        </a>
        <nav aria-label="Primary" className="relative hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-[15px] text-muted transition-colors duration-150 hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <JumpToForm target="hero" location="nav" className={buttonClasses({ size: "sm", className: "relative" })}>
          <Beam />
          Get early access
          <Arrow />
        </JumpToForm>
      </div>
    </header>
  );
}
