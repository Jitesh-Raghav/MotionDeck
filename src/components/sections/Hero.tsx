import { HeroBackdrop } from "@/components/hero/HeroBackdrop";
import { HeroShowcase } from "@/components/hero/HeroShowcase";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { Container, Eyebrow, Serif } from "@/components/ui/layout";

export function Hero({ waitlistCount }: { waitlistCount: number | null }) {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-x-clip pt-32 pb-16 md:pt-40 md:pb-20 lg:pb-24"
    >
      <HeroBackdrop />
      <Container className="flex flex-col items-center text-center">
        {/* No entrance animation on the copy: the headline is the LCP element. */}
        <Eyebrow live className="text-muted" data-hero-clear>
          Early access
        </Eyebrow>
        <h1 id="hero-title" data-hero-clear className="mt-7 text-display text-balance">
          Presentations that <Serif>move</Serif>.
        </h1>
        <p data-hero-clear className="mt-7 max-w-[620px] text-body text-pretty text-muted">
          Type a topic. Get a beautifully animated deck in under a minute — ready to present, record,
          or post as video.
        </p>
        <div data-hero-clear className="mt-10 w-full max-w-[500px]">
          <EmailCapture source="hero" hint="Free to start. No design skills needed." />
        </div>
        {waitlistCount !== null && (
          <p className="mt-1 text-[15px] text-muted">
            {waitlistCount.toLocaleString("en-US")} people are already on the list.
          </p>
        )}
        <HeroShowcase />
      </Container>
    </section>
  );
}
