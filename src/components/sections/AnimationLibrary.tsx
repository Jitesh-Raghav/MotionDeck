import { Container, SectionHeader, Serif, StageSection } from "@/components/ui/layout";
import { AnimationBento } from "./AnimationBento";

export function AnimationLibrary() {
  return (
    <StageSection
      id="animations"
      labelledBy="animations-title"
      // Extra room at the bottom: the next section overlaps it with rounded corners.
      className="pb-30 md:pb-34 lg:pb-42"
    >
      <Container>
        <SectionHeader
          id="animations-title"
          tone="dark"
          eyebrow="Animation library"
          title={
            <>
              Motion, tuned by <Serif>hand</Serif>.
            </>
          }
          subhead="Every animation is designed and tested, so your deck never looks random or broken."
        />
        <AnimationBento />
      </Container>
    </StageSection>
  );
}
