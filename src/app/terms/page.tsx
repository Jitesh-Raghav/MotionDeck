import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms — Motiondeck",
  description: "Motiondeck is in early access. Full terms will be published before launch.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms" updated="September 2026">
      <p>
        Motiondeck is in early access and isn&apos;t generally available yet. Joining the
        waitlist doesn&apos;t create an account or commit you to anything.
      </p>
      <p>Full terms of service will be published here before launch.</p>
      <p>
        Questions? Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>
    </LegalPage>
  );
}
