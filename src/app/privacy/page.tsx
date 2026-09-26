import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy — Motiondeck",
  description: "What Motiondeck collects when you join the waitlist, and how it's used.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy" updated="September 2026">
      <p>
        Motiondeck is in early access. The only personal data this site collects is what you
        give us when you join the waitlist.
      </p>
      <h2>What we collect</h2>
      <p>Your email address, which signup form you used, and when you signed up.</p>
      <h2>How we use it</h2>
      <p>
        Only to email you about Motiondeck early access and launch. We don&apos;t sell it or share
        it with anyone else.
      </p>
      <h2>Where it&apos;s stored</h2>
      <p>In our database, hosted by Supabase.</p>
      <h2>Cookies</h2>
      <p>This site doesn&apos;t use tracking or advertising cookies.</p>
      <h2>Removing your data</h2>
      <p>
        Email <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> and we&apos;ll
        delete your address.
      </p>
    </LegalPage>
  );
}
