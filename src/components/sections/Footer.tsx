import { Container } from "@/components/ui/layout";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { FooterWordmark } from "./FooterWordmark";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: `mailto:${site.contactEmail}`, label: "Contact" },
];

/** `afterStage`: the dark stage above already ends in a pixel edge, so no rule. */
export function Footer({ afterStage = false }: { afterStage?: boolean }) {
  return (
    <footer className={cn("relative overflow-hidden bg-bg", !afterStage && "border-t border-hairline")}>
      <Container
        className={cn(
          "flex flex-col gap-6 md:flex-row md:items-center md:justify-between",
          // Leave room for the pixel edge dissolving down from the stage.
          afterStage ? "pt-28" : "pt-14 md:pt-16",
        )}
      >
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
      {/* Huge pixel wordmark, cropped by the bottom edge; it dithers in on view. */}
      <div aria-hidden="true" className="mt-10 overflow-hidden select-none md:mt-14">
        <FooterWordmark />
      </div>
    </footer>
  );
}
