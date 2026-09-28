import { Beam, buttonClasses } from "@/components/ui/button";
import { JumpToForm } from "@/components/ui/JumpToForm";
import { Container, Section, SectionHeader } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { cn } from "@/lib/cn";
import { STAGGER } from "@/lib/motion";

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["3 decks a month", "720p export with watermark", "PDF export"],
  },
  {
    name: "Creator",
    price: "$19",
    period: "/mo",
    featured: true,
    features: ["50 decks a month", "1080p MP4 with no watermark", "All animations", "Share links"],
  },
  {
    name: "Pro",
    price: "$39",
    period: "/mo",
    features: ["4K export", "Brand kit", "AI custom visuals", "Priority rendering"],
  },
];

function Check({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className={cn("mt-1 size-4 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3.5 8.5l2.8 2.7 6.2-6.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Pricing() {
  return (
    <Section id="pricing" labelledBy="pricing-title" className="border-t border-hairline">
      <Container>
        <SectionHeader
          id="pricing-title"
          align="center"
          eyebrow="Early access pricing"
          title="Simple pricing. Start free."
          serif="free"
          subhead="Early-access pricing. Upgrade only when you need more."
        />
        <ul className="mx-auto mt-12 grid max-w-[1120px] gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
          {plans.map((plan, index) => (
            <Reveal key={plan.name} as="li" delay={index * STAGGER} className="flex">
              <SpotlightCard
                spot={plan.featured ? "rgba(255,255,255,0.08)" : "rgba(255,90,31,0.07)"}
                className={cn(
                  "flex w-full flex-col rounded-card p-8",
                  plan.featured
                    ? "on-dark stage-card bg-stage text-stage-ink shadow-window md:-translate-y-4"
                    : "border border-hairline bg-surface",
                )}
              >
                {plan.featured && <Beam />}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-medium">{plan.name}</h3>
                  {plan.featured && (
                    <span className="flex items-center gap-2 rounded-full border border-stage-line px-2.5 py-1 font-mono text-[12px] tracking-[0.1em] text-stage-ink uppercase">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
                      Most popular
                    </span>
                  )}
                </div>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-[56px] leading-none font-medium tracking-[-0.045em] tabular-nums">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={cn("text-[15px]", plan.featured ? "text-stage-muted" : "text-muted")}>
                      {plan.period}
                    </span>
                  )}
                </p>
                <ul className="mt-8 mb-10 flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-[15px] leading-6">
                      <Check className={plan.featured ? "text-accent" : "text-muted"} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <JumpToForm
                  target="final-cta"
                  location="pricing"
                  className={buttonClasses({
                    variant: plan.featured ? "light" : "secondary",
                    className: "w-full",
                  })}
                >
                  {plan.featured && <Beam />}
                  Join the waitlist
                </JumpToForm>
              </SpotlightCard>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
