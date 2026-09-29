import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteFooter } from "@/components/site-footer";
import { LandingNav } from "@/components/landing/nav";
import { SiteEffects } from "@/components/landing/page-shell";
import { Hero } from "@/components/landing/hero";
import { Showcase } from "@/components/landing/showcase";
import { Pillars } from "@/components/landing/pillars";
import { MusicSection } from "@/components/landing/music-section";
import { VoiceSection } from "@/components/landing/voice-section";
import { VideoSection } from "@/components/landing/video-section";
import { CreatorSection } from "@/components/landing/creator-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq, FinalCta, HowItWorks } from "@/components/landing/closing";
import { displayFont, serifFont } from "@/components/landing/fonts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Zinetic Music | Music Distribution, AI Voice & AI Video",
  description:
    "Distribute your music worldwide and keep up to 90% of your royalties. Generate music, voices and sound effects, dub, translate and lip-sync video, and check any YouTube channel's MCN, all in one Zinetic account.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className={`zl dark ${displayFont.variable} ${serifFont.variable} relative min-h-screen overflow-x-clip`}>
      <SiteEffects />
      <div aria-hidden className="zl-grain" />
      <LandingNav />
      <main className="relative z-10">
        <Hero />
        <Showcase />
        <Pillars />
        <MusicSection />
        <VoiceSection />
        <VideoSection />
        <CreatorSection />
        <PricingSection />
        <HowItWorks />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
