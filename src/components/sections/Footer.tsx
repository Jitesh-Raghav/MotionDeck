import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: `mailto:${site.contactEmail}`, label: "Contact" },
];

export function Footer({ overlap = false }: { overlap?: boolean }) {
  return (
    <footer
      className={cn(
        "relative overflow-hidden bg-bg",
        // On the home page it rises over the dark stage above with rounded corners.
        overlap ? "z-10 -mt-10 rounded-t-stage" : "border-t border-hairline",
      )}
    >
      <Container className="flex flex-col gap-6 pt-14 md:flex-row md:items-center md:justify-between md:pt-16">
        <p className="text-[15px] text-muted">
          © {new Date().getFullYear()} Motiondeck. {site.tagline}
        </p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href} className="rounded-sm text-[15px] text-muted transition-colors duration-150 hover:text-ink">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      {/*
        Huge wordmark cropped by the bottom edge. It's a decorative graphic,
        so it's drawn as SVG and stretched to exactly the full width.
      */}
      <div aria-hidden="true" className="mt-10 overflow-hidden select-none md:mt-14">
        <svg viewBox="0 0 1000 150" className="-mb-[3%] block w-full" preserveAspectRatio="xMidYMin meet">
          <text
            x="500"
            y="176"
            textAnchor="middle"
            textLength="990"
            lengthAdjust="spacingAndGlyphs"
            fontSize="236"
            fontWeight={500}
            letterSpacing="-10"
            fill="rgba(11,11,12,0.06)"
          >
            Motiondeck
          </text>
        </svg>
      </div>
    </footer>
  );
}
