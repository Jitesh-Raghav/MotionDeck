import { Container, Eyebrow, Section, Serif } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/site";
import { FaqList } from "./FaqList";

export function Faq() {
  return (
    <Section id="faq" labelledBy="faq-title" className="border-t border-hairline">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <Eyebrow className="text-muted">FAQ</Eyebrow>
            </Reveal>
            <Reveal delay={0.07}>
              <h2 id="faq-title" className="mt-5 text-h2 text-balance">
                Questions, <Serif>answered</Serif>.
              </h2>
            </Reveal>
            <Reveal delay={0.14}>
              <p className="mt-5 text-body text-muted">
                Still curious?{" "}
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="rounded-sm text-ink underline decoration-hairline-strong underline-offset-4 hover:decoration-ink"
                >
                  Email me.
                </a>
              </p>
            </Reveal>
          </div>
        </div>
        <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
          <FaqList />
        </Reveal>
      </Container>
    </Section>
  );
}
