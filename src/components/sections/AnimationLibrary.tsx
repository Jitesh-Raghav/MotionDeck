import { Container, SectionHeader, StageSection } from "@/components/ui/layout";
import { AnimationBento } from "./AnimationBento";

export function AnimationLibrary() {
  return (
    <StageSection
      id="animations"
      labelledBy="animations-title"
    >
      <Container>
        <SectionHeader
          id="animations-title"
          tone="dark"
          eyebrow="Animation library"
          title="Motion, tuned by hand."
          serif="hand"
          subhead="Every animation is designed and tested, so your deck never looks random or broken."
        />
        <AnimationBento />
      </Container>
    </StageSection>
  );
}
