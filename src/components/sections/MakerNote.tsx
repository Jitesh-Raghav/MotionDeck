import { AsciiField } from "@/components/ui/AsciiField";
import { Container, Section, SectionHeader, Serif } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/Reveal";

/*
 * PLACEHOLDER SECTION — replace before launch:
 *   1. MAKER.photo: path to a square photo in /public (e.g. "/maker.jpg"), or keep null for initials.
 *   2. MAKER.name and MAKER.role.
 *   3. MAKER.note: 2–3 sentences in your own words.
 */
const MAKER = {
  photo: null as string | null, // PLACEHOLDER: e.g. "/maker.jpg"
  initials: "YN", // PLACEHOLDER: your initials, shown until there's a photo
  name: "[Your name]", // PLACEHOLDER
  role: "[Your role, e.g. Founder]", // PLACEHOLDER
  // PLACEHOLDER: replace with 2–3 sentences of your own.
  note: "[Write 2–3 sentences here: who you are, why you're building Motiondeck, and what you want it to do for people who present on screen.]",
};

export function MakerNote() {
  return (
    <Section labelledBy="maker-title" className="relative isolate overflow-hidden border-t border-hairline">
      <Container className="flex flex-col items-center">
        <SectionHeader
          id="maker-title"
          align="center"
          eyebrow="A note from the maker"
          title={
            <>
              Why I&apos;m building <Serif>this</Serif>.
            </>
          }
          subhead="A few words from the person making Motiondeck."
        />
        <div className="relative mt-12 w-full max-w-[600px]">
          {/* The wave runs edge to edge, centred on the card. */}
          <AsciiField
            variant="wave"
            mask="band"
            className="top-1/2 left-1/2 -z-10 h-[460px] w-screen -translate-x-1/2 -translate-y-1/2"
          />
          <Reveal delay={0.1}>
            <figure className="rounded-card border border-hairline bg-surface p-8 text-center shadow-[0_1px_2px_rgba(11,11,12,0.04)] sm:p-10">
              <blockquote className="text-[20px] leading-[1.55] tracking-[-0.01em] text-ink text-pretty">
                {MAKER.note}
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-center gap-4 text-left">
                {MAKER.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- a single small local photo
                  <img src={MAKER.photo} alt="" width={56} height={56} className="size-14 rounded-full object-cover" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid size-14 place-items-center rounded-full border border-dashed border-hairline-strong bg-bg font-mono text-[13px] text-muted"
                  >
                    {MAKER.initials}
                  </span>
                )}
                <span className="flex flex-col">
                  <span className="text-[16px] font-medium">{MAKER.name}</span>
                  <span className="text-[15px] text-muted">{MAKER.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
