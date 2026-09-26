import { AsciiField } from "@/components/ui/AsciiField";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { Container, Eyebrow, Serif, StageSection } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/Reveal";
import { DriftField } from "./DriftField";

export function FinalCta({ waitlistCount }: { waitlistCount: number | null }) {
  return (
    <StageSection
      labelledBy="final-cta-title"
      spotlight="center"
      // Extra room at the bottom: the footer overlaps it with rounded corners.
      className="pb-30 md:pb-34 lg:pb-42"
    >
      <AsciiField variant="embers" mask="bottom" tone="dark" className="inset-x-0 bottom-0 -z-10 h-[70%] w-full" />
      <DriftField />
      <Container className="flex flex-col items-center py-4 text-center md:py-8">
        <Reveal>
          <Eyebrow live className="text-stage-muted">
            Early access
          </Eyebrow>
        </Reveal>
        <Reveal delay={0.07}>
          <h2 id="final-cta-title" className="mt-7 text-display text-balance">
            Make your next deck <Serif>move</Serif>.
          </h2>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="mt-7 text-body text-stage-muted">Join the waitlist. We&apos;ll email you when it&apos;s ready.</p>
        </Reveal>
        <Reveal delay={0.21} className="mt-10 w-full">
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
