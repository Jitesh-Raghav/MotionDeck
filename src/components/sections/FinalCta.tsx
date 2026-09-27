import { EmailCapture } from "@/components/ui/EmailCapture";
import { Container, Eyebrow, StageSection } from "@/components/ui/layout";
import { MaskHeading } from "@/components/ui/MaskHeading";
import { Reveal } from "@/components/ui/Reveal";
import { DriftField } from "./DriftField";

export function FinalCta({ waitlistCount }: { waitlistCount: number | null }) {
  return (
    <StageSection labelledBy="final-cta-title" spotlight="center">
      <DriftField />
      <Container className="flex flex-col items-center text-center">
        <Reveal>
          <Eyebrow live className="text-stage-muted">
            Early access
          </Eyebrow>
        </Reveal>
        <MaskHeading
          id="final-cta-title"
          text="Make your next deck move."
          serif="move"
          className="mt-4 text-display"
        />
        <Reveal delay={0.14}>
          <p className="mt-5 text-body text-stage-muted">Join the waitlist. We&apos;ll email you when it&apos;s ready.</p>
        </Reveal>
        <Reveal delay={0.21} className="mt-9 w-full">
          <EmailCapture source="final-cta" tone="dark" />
          {waitlistCount !== null && (
            <p className="mt-1 text-[15px] text-stage-muted">
              {waitlistCount.toLocaleString("en-US")} people are already on the list.
            </p>
          )}
        </Reveal>
      </Container>
    </StageSection>
  );
}
