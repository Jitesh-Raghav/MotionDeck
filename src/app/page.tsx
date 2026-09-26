import { Nav } from "@/components/nav/Nav";
import { AnimationLibrary } from "@/components/sections/AnimationLibrary";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { BuiltFor } from "@/components/sections/BuiltFor";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { Formats } from "@/components/sections/Formats";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { MakerNote } from "@/components/sections/MakerNote";
import { Pricing } from "@/components/sections/Pricing";
import { getPublicWaitlistCount } from "@/lib/waitlist/count";

// Re-read the waitlist count at most every 10 minutes.
export const revalidate = 600;

export default async function Home() {
  const waitlistCount = await getPublicWaitlistCount();
  return (
    <>
      <Nav />
      <main>
        <Hero waitlistCount={waitlistCount} />
        <BeforeAfter />
        <HowItWorks />
        <AnimationLibrary />
        <Formats />
        <BuiltFor />
        <MakerNote />
        <Pricing />
        <Faq />
        <FinalCta waitlistCount={waitlistCount} />
      </main>
      <Footer overlap />
    </>
  );
}
