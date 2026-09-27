import { Container, SectionHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/Reveal";
import { STAGGER } from "@/lib/motion";
import { FormatFrames } from "./FormatFrames";

const exports = ["MP4 up to 4K", "PDF", "Share link", "Fullscreen present mode"];

export function Formats() {
  return (
    <section
      aria-labelledby="formats-title"
      className="relative py-[clamp(72px,9vw,120px)]"
    >
      <Container>
        <SectionHeader
          id="formats-title"
          align="center"
          eyebrow="One deck, every format"
          title="Present it. Record it. Post it."
          serif="Post"
          subhead="One deck adapts to every screen you post on."
        />
        <Reveal delay={0.1}>
          <FormatFrames />
        </Reveal>
        <ul className="mt-12 grid grid-cols-2 border-t border-hairline lg:mt-16 lg:grid-cols-4">
          {exports.map((item, index) => (
            <Reveal
              key={item}
              as="li"
              delay={index * STAGGER}
              className="flex flex-col gap-3 border-b border-hairline py-6 pr-4 lg:border-b-0 lg:border-l lg:px-6 lg:first:border-l-0 lg:first:pl-0"
            >
              <span className="font-mono text-[12px] tracking-[0.1em] text-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-[20px] leading-7 font-medium tracking-[-0.015em]">{item}</span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
