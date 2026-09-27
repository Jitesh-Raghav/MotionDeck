import { HowItWorksStory } from "@/components/story/HowItWorksStory";
import { Container, Section, SectionHeader } from "@/components/ui/layout";

export function HowItWorks() {
  return (
    <Section id="how-it-works" labelledBy="how-title" className="border-t border-hairline lg:pb-12">
      <Container>
        <SectionHeader
          id="how-title"
          eyebrow="How it works"
          title="From idea to deck in three steps."
          serif="deck"
          subhead="You stay in control at every step."
        />
        <HowItWorksStory />
      </Container>
    </Section>
  );
}
