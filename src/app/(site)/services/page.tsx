import { PageHero } from "@/components/landing/page-parts";
import { SectionHeading } from "@/components/landing/primitives";
import { ServiceCard } from "@/components/landing/service-parts";
import { FinalCta } from "@/components/landing/closing";
import { CATEGORIES, SERVICES, servicesIn, type ServiceCategory } from "@/lib/landing-services";

export const metadata = {
  title: "All Services | Zinetic Music",
  description:
    "Music distribution, AI music, voice, audio and video tools, and YouTube channel checks. Every Zinetic Music service, with clear pricing.",
};

const ANCHORS: Record<ServiceCategory, string> = {
  music: "music",
  voice: "voice",
  video: "video",
  creator: "creator-tools",
};

const BLURBS: Record<ServiceCategory, string> = {
  music: "Release your music worldwide, or generate something new from a prompt.",
  voice: "Generate and change voices, design sound, transcribe, clean and dub.",
  video: "Avatars, translation, lip sync, short clips and video from a prompt.",
  creator: "Find the network behind any YouTube channel.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow={`${SERVICES.length} services`}
        title={
          <>
            Everything you create, <span className="zl-serif zl-grad-text">in one place.</span>
          </>
        }
        sub="Pick a service to see how it works, what is included and what it costs. Every one is available from the same Zinetic Music account."
      />

      {CATEGORIES.map((c) => (
        <section key={c.id} id={ANCHORS[c.id]} className="scroll-mt-28 px-5 py-14 sm:py-20">
          <SectionHeading align="left" eyebrow={c.label} title={c.label} sub={BLURBS[c.id]} className="mx-auto max-w-7xl" />
          <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicesIn(c.id).map((s, i) => (
              <ServiceCard key={s.id} service={s} delay={(i % 3) * 0.06} />
            ))}
          </div>
        </section>
      ))}

      <FinalCta />
    </>
  );
}
