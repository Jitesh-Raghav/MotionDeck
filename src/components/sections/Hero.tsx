import { HeroStage } from "@/components/hero/HeroShowcase";
import { EmailCapture } from "@/components/ui/EmailCapture";
import { Eyebrow } from "@/components/ui/layout";

// Intro timing (CSS, so it plays on first paint): headline words 80ms apart,
// then the subhead, then the email pill.
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

export function Hero({ waitlistCount }: { waitlistCount: number | null }) {
  return (
    <HeroStage
      copy={
        <div data-hero-copy className="flex w-full flex-col items-center">
          <span className="rise-in" style={delay(150)}>
            <Eyebrow live className="text-muted">
              Early access
            </Eyebrow>
          </span>
          <h1 id="hero-title" className="mt-6 text-display text-balance">
            <span className="rise-in" style={delay(250)}>
              Presentations
            </span>{" "}
            <span className="rise-in" style={delay(330)}>
              that
            </span>{" "}
            <span className="rise-in" style={delay(410)}>
              <span className="sway">
                <em className="serif-accent">move</em>
              </span>
              .
            </span>
          </h1>
          <p className="rise-in mt-6 max-w-[620px] text-body text-pretty text-muted" style={delay(600)}>
            Type a topic. Get a beautifully animated deck in under a minute — ready to present, record,
            or post as video.
          </p>
          <div className="rise-in mt-9 w-full max-w-[500px]" style={delay(760)}>
            <EmailCapture source="hero" hint="Free to start. No design skills needed." />
          </div>
          {waitlistCount !== null && (
            <p className="mt-1 text-[15px] text-muted">
              {waitlistCount.toLocaleString("en-US")} people are already on the list.
            </p>
          )}
        </div>
      }
    />
  );
}
