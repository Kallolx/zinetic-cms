import Link from "next/link";
import { LuArrowUpRight, LuBadgeCheck, LuBuilding2, LuGlobe, LuMapPin, LuScrollText } from "react-icons/lu";
import { AutoVideo, Reveal, SectionHeading } from "@/components/landing/primitives";
import { FactCard, PageHero } from "@/components/landing/page-parts";
import { ZButton } from "@/components/landing/button";
import { MEDIA, servicesIn, type ServiceCategory } from "@/lib/landing-services";

export const metadata = { title: "About Us | Zinetic Music" };

const PILLARS: { id: ServiceCategory; title: string; href: string; media: string; line: string }[] = [
  { id: "music", title: "Music", href: "/#music", media: MEDIA.guitar, line: "Worldwide distribution and AI music generation." },
  { id: "voice", title: "AI Voice & Audio", href: "/#voice", media: MEDIA.studioSinger, line: "Voices, dubbing, sound effects and clean audio." },
  { id: "video", title: "AI Video", href: "/#video", media: MEDIA.presenterWoman, line: "Avatars, translation, lip sync and short clips." },
  { id: "creator", title: "Creator Tools", href: "/#creator-tools", media: MEDIA.videoEditing, line: "Find the network behind any YouTube channel." },
];

function Collage() {
  const card = "absolute overflow-hidden rounded-[24px] border border-(--zl-line) shadow-[0_30px_80px_-30px_rgb(0_0_0/0.6)]";
  return (
    <div className="relative mx-auto hidden aspect-[5/4] w-full max-w-[520px] sm:block">
      <div className={`${card} top-0 left-[4%] h-[62%] w-[46%] -rotate-6`}>
        <AutoVideo src={MEDIA.presenterWoman} />
      </div>
      <div className={`${card} top-[8%] right-0 h-[70%] w-[42%] rotate-6`}>
        <AutoVideo src={MEDIA.neonShades} />
      </div>
      <div className={`${card} bottom-0 left-[26%] h-[44%] w-[50%] -rotate-2`}>
        <AutoVideo src={MEDIA.guitar} />
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title={
          <>
            Built in Dhaka. <span className="zl-serif zl-grad-text">Made for creators</span> everywhere.
          </>
        }
        sub="Zinetic Music Limited is a Bangladesh-based digital music and technology company providing music distribution, digital creator services, subscription-based tools and AI-powered media solutions to artists, labels, creators and businesses."
        aside={<Collage />}
      />

      <section className="px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="zl-display text-[clamp(1.9rem,3.6vw,3rem)] font-semibold">
              One secure platform for <span className="zl-serif zl-grad-text">everything you publish.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-base leading-[1.8] text-(--zl-muted) sm:text-lg">
              Our services are designed to support creators and digital businesses with access to
              music distribution, digital media tools, AI-powered audio and video solutions, and
              other online services through a secure and user-friendly platform.
            </p>
            <p className="mt-4 text-base leading-[1.8] text-(--zl-muted) sm:text-lg">
              Zinetic Music, the YouTube MCN (Multi-Channel Network) checker and copyright
              management platform, is one of these services: it instantly identifies which network
              a YouTube channel belongs to, surfaces verified contact details, and helps manage
              copyright claims.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <SectionHeading eyebrow="What we do" title="Four studios, one account." />
        <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => {
            const count = servicesIn(p.id).length;
            return (
              <Reveal key={p.id} delay={i * 0.08} className="min-w-0">
                <Link
                  href={p.href}
                  className="group relative block h-[340px] overflow-hidden rounded-[26px] border border-(--zl-line) text-white"
                >
                  <AutoVideo src={p.media} className="transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
                  <span className="absolute top-4 left-4 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    {count} {count === 1 ? "service" : "services"}
                  </span>
                  <LuArrowUpRight className="absolute top-4 right-4 size-5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h3 className="zl-display text-2xl font-semibold">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-white/75">{p.line}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <SectionHeading
          eyebrow="Company information"
          title={
            <>
              The details, <span className="zl-serif zl-grad-text">in the open.</span>
            </>
          }
        />
        <div className="mx-auto mt-14 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="min-w-0">
            <FactCard icon={<LuBuilding2 className="size-5" />} label="Company name">
              Zinetic Music Limited
            </FactCard>
          </Reveal>
          <Reveal delay={0.06} className="min-w-0">
            <FactCard icon={<LuGlobe className="size-5" />} label="Country">
              Bangladesh
            </FactCard>
          </Reveal>
          <Reveal delay={0.12} className="min-w-0">
            <FactCard icon={<LuScrollText className="size-5" />} label="RJSC registration no.">
              C-195622/2024
            </FactCard>
          </Reveal>
          <Reveal delay={0.18} className="min-w-0">
            <FactCard icon={<LuBadgeCheck className="size-5" />} label="Trade license no.">
              TRAD/DNCC/000393/2024
            </FactCard>
          </Reveal>
          <Reveal delay={0.24} className="min-w-0 sm:col-span-1 lg:col-span-2">
            <FactCard icon={<LuMapPin className="size-5" />} label="Registered address">
              258/B, Batar Goli, Boro Moghbazar, Ramna, Dhaka 1217, Bangladesh
            </FactCard>
          </Reveal>
        </div>
      </section>

      <section className="px-5 py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <Reveal>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-(--zl-muted)">Management</p>
            <h2 className="zl-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)] font-semibold">
              The people <span className="zl-serif zl-grad-text">behind it.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex items-center gap-5 rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-6 sm:gap-7 sm:p-9">
              <span className="zl-grad-bg zl-display flex size-20 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white shadow-[0_18px_40px_-16px_rgb(255_61_134/0.7)] sm:size-24">
                ZR
              </span>
              <div className="min-w-0">
                <p className="zl-display text-2xl font-semibold sm:text-3xl">Zishan Mahmud Rudro</p>
                <p className="mt-1.5 text-(--zl-muted)">Managing Director &amp; CEO</p>
                <p className="text-(--zl-muted)">Zinetic Music Limited</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pt-8 pb-24 sm:pb-32">
        <Reveal className="mx-auto max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-[32px] border border-(--zl-line) bg-(--zl-surface) p-8 sm:p-12">
            <div aria-hidden className="absolute -right-16 -bottom-24 -z-10 size-80 rounded-full bg-(--zl-glow-a) blur-[90px]" />
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-(--zl-muted)">Service activation time</p>
            <h2 className="zl-display mt-4 max-w-3xl text-[clamp(1.7rem,3.2vw,2.6rem)] font-semibold">
              Nothing to ship, nothing to wait days for.
            </h2>
            <p className="mt-4 max-w-3xl leading-[1.8] text-(--zl-muted) sm:text-lg">
              Zinetic Music is a fully digital, subscription-style service with no physical goods,
              so delivery time and stock quantity do not apply. Wallet top-ups are credited to your
              account within a few minutes of a successful payment, and channel/network checks
              return a result instantly.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ZButton href="/register">Start now</ZButton>
              <ZButton href="/contact" variant="outline" arrow={false}>
                Contact us
              </ZButton>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
