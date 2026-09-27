import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { BuiltForCards } from "./BuiltForCards";

export function BuiltFor() {
  return (
    <Section labelledBy="built-for-title" className="border-t border-hairline">
      <Container>
        <SectionHeader
          id="built-for-title"
          eyebrow="Built for"
          title="Made for people who present on screen."
          serif="screen"
          subhead="For anyone whose audience is watching a screen."
        />
        <BuiltForCards />
      </Container>
    </Section>
  );
}
