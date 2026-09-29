"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { LuArrowRight, LuCheck, LuDisc3, LuSparkles } from "react-icons/lu";
import { AutoVideo, Eyebrow, Reveal } from "@/components/landing/primitives";
import { MEDIA, SERVICES, formatPrice } from "@/lib/landing-services";
import { cn } from "@/lib/utils";

const distribution = SERVICES.find((s) => s.id === "distribution")!;
const generator = SERVICES.find((s) => s.id === "music-generator")!;

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    const controls = animate(0, to, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, suffix, reduce]);

  return (
    <span ref={ref}>
      0{suffix}
    </span>
  );
}

const ROYALTY = [
  { plan: "Artist", share: 80 },
  { plan: "Pro", share: 85 },
  { plan: "Label", share: 90 },
];

const MUSIC_PROMPTS = [
  "Bangla folk, dotara, rainy evening",
  "Afrobeats, summer, male vocal",
  "Dark trap, 140 BPM, 808s",
  "Wedding song, strings, duet",
  "Lo-fi study beat, no vocals",
];

function Equalizer() {
  return (
    <div className="flex h-16 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: 36 }).map((_, i) => (
        <span
          key={i}
          className="w-[4px] origin-bottom rounded-full bg-white/80"
          style={{
            height: `${30 + ((i * 37) % 70)}%`,
            animation: `zl-bar ${0.8 + ((i * 13) % 9) / 10}s ease-in-out ${(i % 7) * 0.08}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function MusicSection() {
  return (
    <section id="music" className="scroll-mt-24 px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow>Music Distribution</Eyebrow>
          <h2 className="zl-display mt-5 text-[clamp(2.4rem,5.2vw,4.6rem)] font-semibold">
            Distribute your music worldwide &amp; keep up to{" "}
            <span className="zl-grad-text">90%</span> of your royalties.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--zl-muted)">
            Unlimited releases to the major streaming platforms, an analytics dashboard, and a
            royalty report every month. One yearly price, no per-release fees.
          </p>

          <div className="mt-10 flex items-end gap-6">
            <p className="zl-display text-[clamp(5rem,12vw,9rem)] font-bold leading-none">
              <CountUp to={90} suffix="%" />
            </p>
            <p className="mb-4 max-w-[12rem] text-sm leading-snug text-(--zl-muted)">
              of every royalty stays yours on the Label plan
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {ROYALTY.map((r, i) => (
              <div key={r.plan} className="flex items-center gap-4">
                <span className="w-14 text-sm font-medium">{r.plan}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-(--zl-surface-2)">
                  <motion.div
                    className="zl-grad-bg h-full rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.share}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <span className="w-10 text-right text-sm tabular-nums text-(--zl-muted)">{r.share}%</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="relative mx-auto aspect-square w-full max-w-[560px]">
          <div className="absolute inset-[6%] rotate-[-6deg] overflow-hidden rounded-[28px] shadow-[0_40px_100px_-40px_rgb(0_0_0/0.7)]">
            <Image src={MEDIA.purpleStage} alt="" fill sizes="560px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent" />
          </div>
          <div
            className="absolute top-[18%] -right-[4%] size-[58%] overflow-hidden rounded-full border-[6px] border-(--zl-bg) shadow-2xl"
            style={{ animation: "zl-spin 14s linear infinite" }}
          >
            <Image src={MEDIA.amberVinyl} alt="" fill sizes="340px" className="object-cover" />
          </div>
          <div className="absolute bottom-[4%] left-[2%] w-[68%] rounded-2xl border border-(--zl-line) bg-(--zl-surface)/85 p-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="zl-grad-bg flex size-11 items-center justify-center rounded-xl text-white">
                <LuDisc3 className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Your next single</p>
                <p className="truncate text-xs text-(--zl-muted)">Delivering to streaming platforms</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-(--zl-surface-2)">
              <motion.div
                className="zl-grad-bg h-full rounded-full"
                initial={{ width: "8%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 3, delay: 0.4, ease: "easeInOut" }}
              />
            </div>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 grid max-w-7xl gap-5 md:grid-cols-3">
        {distribution.tiers.map((tier, i) => {
          const { amount, suffix } = formatPrice(tier);
          const featured = i === 1;
          return (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-[28px] border p-7",
                  featured
                    ? "border-transparent bg-(--zl-text) text-(--zl-bg)"
                    : "border-(--zl-line) bg-(--zl-surface)"
                )}
              >
                {featured && (
                  <span className="zl-grad-bg absolute -top-3 right-7 rounded-full px-3 py-1 text-xs font-semibold text-white">
                    Recommended
                  </span>
                )}
                <p className="text-sm font-semibold uppercase tracking-[0.16em] opacity-70">{tier.name}</p>
                <p className="mt-4 flex items-baseline gap-1">
                  <span className="zl-display text-5xl font-bold">{amount}</span>
                  <span className="text-sm opacity-60">{suffix}</span>
                </p>
                <p className="mt-2 font-medium">{tier.quota}</p>
                <ul className="mt-6 flex flex-1 flex-col gap-2.5 text-sm">
                  {tier.perks?.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5">
                      <LuCheck className="mt-0.5 size-4 shrink-0 text-[#ff5b4a]" />
                      <span className="opacity-85">{perk}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={cn(
                    "mt-8 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-transform hover:scale-[1.02]",
                    featured ? "zl-grad-bg text-white" : "bg-(--zl-text) text-(--zl-bg)"
                  )}
                >
                  {distribution.cta}
                  <LuArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal className="mx-auto mt-24 max-w-7xl">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-(--zl-line) text-white">
          <div className="absolute inset-0 -z-10">
            <AutoVideo src={MEDIA.djDeck} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
          </div>
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:p-16">
            <div>
              <p className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/60">
                <LuSparkles className="size-3.5" /> AI Music Generator
              </p>
              <h3 className="zl-display mt-5 text-[clamp(2.2rem,4.6vw,4rem)] font-semibold">
                Describe it. <span className="zl-serif">Hear it.</span>
              </h3>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">{generator.blurb}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {MUSIC_PROMPTS.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80 backdrop-blur-md"
                  >
                    {p}
                  </span>
                ))}
              </div>
              <div className="mt-10">
                <Equalizer />
              </div>
            </div>
            <div className="flex flex-col justify-end gap-3">
              {generator.tiers.map((tier) => {
                const { amount, suffix } = formatPrice(tier);
                return (
                  <div
                    key={tier.name}
                    className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.06] px-5 py-4 backdrop-blur-md"
                  >
                    <div>
                      <p className="font-semibold">{tier.name}</p>
                      <p className="text-sm text-white/60">{tier.quota}</p>
                    </div>
                    <p className="text-right">
                      <span className="zl-display text-2xl font-bold">{amount}</span>
                      <span className="text-xs text-white/60">{suffix}</span>
                    </p>
                  </div>
                );
              })}
              <Link
                href="/register"
                className="zl-grad-bg mt-2 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white"
              >
                {generator.cta} <LuArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
