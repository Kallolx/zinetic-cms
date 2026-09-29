import { LuBadgeCheck, LuLifeBuoy, LuMail, LuMapPin, LuPhone, LuScrollText } from "react-icons/lu";
import { AutoVideo, Reveal } from "@/components/landing/primitives";
import { FactCard, PageHero } from "@/components/landing/page-parts";
import { ZButton } from "@/components/landing/button";
import { MEDIA } from "@/lib/landing-services";

export const metadata = { title: "Contact Us | Zinetic Music" };

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={
          <>
            Let&apos;s <span className="zl-serif zl-grad-text">talk.</span>
          </>
        }
        sub="Questions about a plan, a payment or a project? Reach the team directly, by email or phone, or visit our registered office in Dhaka."
      />

      <section className="px-5 pb-16 sm:pb-24">
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal className="min-w-0">
            <FactCard icon={<LuMail className="size-5" />} label="Email" href="mailto:info@zineticmusic.com">
              info@zineticmusic.com
            </FactCard>
          </Reveal>
          <Reveal delay={0.06} className="min-w-0">
            <FactCard icon={<LuPhone className="size-5" />} label="Phone" href="tel:+8809696797267">
              +880 9696 797 267
            </FactCard>
          </Reveal>
          <Reveal delay={0.12} className="min-w-0">
            <FactCard icon={<LuLifeBuoy className="size-5" />} label="Support" href="mailto:support@zineticmusic.com">
              support@zineticmusic.com
            </FactCard>
          </Reveal>
          <Reveal delay={0.18} className="min-w-0 sm:col-span-2">
            <FactCard icon={<LuMapPin className="size-5" />} label="Registered office, Bangladesh">
              258/B, Batar Goli, Boro Moghbazar, Ramna, Dhaka 1217, Bangladesh
            </FactCard>
          </Reveal>
          <Reveal delay={0.24} className="min-w-0">
            <FactCard icon={<LuBadgeCheck className="size-5" />} label="Trade license no.">
              TRAD/DNCC/000393/2024
            </FactCard>
          </Reveal>
          <Reveal delay={0.3} className="min-w-0 sm:col-span-2 lg:col-span-1">
            <FactCard icon={<LuScrollText className="size-5" />} label="RJSC registration no.">
              C-195622/2024
            </FactCard>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-24 sm:pb-32">
        <Reveal className="mx-auto max-w-7xl">
          <div className="relative isolate overflow-hidden rounded-[32px] border border-(--zl-line) text-white">
            <div className="absolute inset-0 -z-10">
              <AutoVideo src={MEDIA.podcastA} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
            </div>
            <div className="max-w-2xl p-8 sm:p-12 lg:p-16">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/60">Support</p>
              <h2 className="zl-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)] font-semibold">
                Account, wallet or payment question?
              </h2>
              <p className="mt-4 text-base leading-[1.8] text-white/75 sm:text-lg">
                Email us and we&apos;ll get back to you as soon as possible. Include your account
                email and, for payments, the transaction date and amount.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ZButton href="mailto:support@zineticmusic.com" variant="light" arrow="up-right">
                  support@zineticmusic.com
                </ZButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
