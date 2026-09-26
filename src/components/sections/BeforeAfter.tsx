import { Container, Section, SectionHeader, Serif } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/Reveal";
import { CompareSlider } from "./CompareSlider";

export function BeforeAfter() {
  return (
    <Section labelledBy="why-title" className="border-t border-hairline">
      <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <SectionHeader
          id="why-title"
          eyebrow="Why motion"
          title={
            <>
              Static slides lose the <Serif>room</Serif>.
            </>
          }
          subhead="Same slide. Same words. Only one holds attention."
          className="lg:col-span-5 xl:col-span-4"
        />
        <Reveal delay={0.1} className="lg:col-span-7 xl:col-start-6">
          <CompareSlider />
        </Reveal>
      </Container>
    </Section>
  );
}
