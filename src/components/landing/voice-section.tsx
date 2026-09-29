"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { LuArrowRightLeft, LuPlay } from "react-icons/lu";
import { AutoVideo, Reveal, SectionHeading } from "@/components/landing/primitives";
import { MEDIA, SERVICES, formatPrice, type Service } from "@/lib/landing-services";
import { cn } from "@/lib/utils";
import { ZButton, ZLink } from "@/components/landing/button";

const byId = (id: string) => SERVICES.find((s) => s.id === id)!;

function fromPrice(s: Service) {
  const min = s.tiers.reduce((a, b) => (b.price < a.price ? b : a));
  const { amount, suffix } = formatPrice(min);
  return `From ${amount}${suffix}`;
}

function Wave({
  bars = 48,
  seed = 1,
  className,
  jagged = false,
}: {
  bars?: number;
  seed?: number;
  className?: string;
  jagged?: boolean;
}) {
  return (
    <div className={cn("flex h-14 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const base = Math.abs(Math.sin((i + 1) * seed * 0.37)) * 0.75 + 0.2;
        const noise = jagged ? ((i * 7919 * seed) % 13) / 30 : 0;
        return (
          <span
            key={i}
            className="w-[3px] flex-1 rounded-full bg-current"
            style={{ height: `${Math.min(100, (base + noise) * 100)}%` }}
          />
        );
      })}
    </div>
  );
}

function Card({
  service,
  className,
  children,
  delay = 0,
}: {
  service: Service;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-7 transition-colors hover:border-(--zl-text)/20">
        <div className="flex items-start justify-between gap-4">
          <h3 className="zl-display text-2xl font-semibold sm:text-[1.7rem]">{service.name}</h3>
          <span className="shrink-0 rounded-full bg-(--zl-surface-2) px-2.5 py-1 text-xs font-medium text-(--zl-muted)">
            {fromPrice(service)}
          </span>
        </div>
        <p className="mt-3 max-w-md text-(--zl-muted)">{service.blurb}</p>
        <div className="mt-8 flex-1">{children}</div>
        <ZLink href="/register" className="mt-8">
          {service.cta}
        </ZLink>
      </div>
    </Reveal>
  );
}

const VOICES = [
  { name: "Warm narrator", g: "radial-gradient(circle at 30% 30%, #ffd2a6, #ff7a1a 45%, #b3261e)" },
  { name: "Bright host", g: "radial-gradient(circle at 30% 30%, #ffc6e0, #ff3d86 45%, #7a1fa2)" },
  { name: "Calm storyteller", g: "radial-gradient(circle at 30% 30%, #cfe1ff, #3d8bff 45%, #3a1c9c)" },
];

function VoiceOrbs() {
  const [active, setActive] = React.useState(1);
  return (
    <div className="grid grid-cols-3 gap-4">
      {VOICES.map((v, i) => (
        <button
          key={v.name}
          type="button"
          onClick={() => setActive(i)}
          className="flex flex-col items-center gap-3 text-center"
        >
          <span className="relative flex aspect-square w-full max-w-[140px] items-center justify-center">
            {active === i && (
              <>
                <span
                  className="absolute inset-0 rounded-full border border-[#ff3d86]/40"
                  style={{ animation: "zl-pulse-ring 1.8s ease-out infinite" }}
                />
                <span
                  className="absolute inset-0 rounded-full border border-[#ff3d86]/30"
                  style={{ animation: "zl-pulse-ring 1.8s ease-out 0.6s infinite" }}
                />
              </>
            )}
            <motion.span
              animate={active === i ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 1.6, repeat: active === i ? Infinity : 0, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full shadow-[inset_0_-10px_30px_rgb(0_0_0/0.35)]"
              style={{ background: v.g }}
            />
            <span className="relative flex size-10 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
              <LuPlay className="size-4 translate-x-[1px] fill-black" />
            </span>
          </span>
          <span className={cn("text-sm", active === i ? "font-semibold" : "text-(--zl-muted)")}>{v.name}</span>
        </button>
      ))}
    </div>
  );
}

const TRANSCRIPT = [
  { t: "00:00", s: "Speaker 1", line: "Welcome back to the show." },
  { t: "00:03", s: "Speaker 2", line: "Thanks for having me, it's been a while." },
  { t: "00:07", s: "Speaker 1", line: "So tell us about the new album." },
];

function Transcript() {
  return (
    <div className="flex flex-col gap-3">
      {TRANSCRIPT.map((row, i) => (
        <motion.div
          key={row.t}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.45, duration: 0.5 }}
          className="flex gap-3 rounded-xl bg-(--zl-surface-2) px-3.5 py-2.5 text-sm"
        >
          <span className="shrink-0 font-mono text-xs text-(--zl-muted)">{row.t}</span>
          <span className="shrink-0 font-semibold text-[#ff5b4a]">{row.s}</span>
          <span>{row.line}</span>
        </motion.div>
      ))}
    </div>
  );
}

function Cleaner() {
  return (
    <div className="rounded-2xl bg-(--zl-surface-2) px-4 py-5">
      <div className="relative">
        <div className="text-(--zl-muted)/60">
          <Wave seed={3} jagged bars={56} />
        </div>
        <motion.div
          className="absolute inset-0 bg-(--zl-surface-2) text-[#ff3d86]"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          whileInView={{ clipPath: "inset(0 48% 0 0)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, delay: 0.3, ease: "easeInOut" }}
        >
          <Wave seed={3} bars={56} />
        </motion.div>
      </div>
      <div className="mt-3 flex justify-between text-xs font-medium">
        <span className="text-[#ff3d86]">Cleaned</span>
        <span className="text-(--zl-muted)">Original, with noise</span>
      </div>
    </div>
  );
}

const DUB_LINES = [
  { lang: "English", text: "Hello, and welcome back to the channel." },
  { lang: "বাংলা", text: "হ্যালো, চ্যানেলে আবার স্বাগতম।" },
  { lang: "Español", text: "Hola, y bienvenidos de nuevo al canal." },
  { lang: "हिन्दी", text: "नमस्ते, चैनल पर फिर से स्वागत है।" },
];

function Dubbing() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % DUB_LINES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
      <AutoVideo src={MEDIA.womanTalking} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        {DUB_LINES.map((d, idx) => (
          <span
            key={d.lang}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md transition-colors",
              idx === i ? "bg-white text-black" : "bg-black/40 text-white/70"
            )}
          >
            {d.lang}
          </span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="rounded-lg bg-black/60 px-3 py-1.5 text-center text-sm font-medium text-white backdrop-blur-md sm:text-base"
          >
            {DUB_LINES[i].text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DubbingCard() {
  const service = byId("dubbing");
  return (
    <Reveal className="lg:col-span-3">
      <div className="group grid overflow-hidden rounded-[28px] border border-(--zl-line) bg-(--zl-surface) transition-colors hover:border-(--zl-text)/20 lg:grid-cols-[1.35fr_1fr]">
        <div className="p-4 sm:p-6 lg:p-7">
          <Dubbing />
        </div>
        <div className="flex flex-col justify-center p-7 sm:p-10 lg:pl-4">
          <span className="w-fit rounded-full bg-(--zl-surface-2) px-2.5 py-1 text-xs font-medium text-(--zl-muted)">
            {fromPrice(service)}
          </span>
          <h3 className="zl-display mt-4 text-2xl font-semibold sm:text-3xl">{service.name}</h3>
          <p className="mt-3 text-(--zl-muted)">{service.blurb}</p>
          <ul className="mt-6 flex flex-col">
            {service.features.map((f) => (
              <li key={f} className="flex items-center gap-3 border-b border-(--zl-line) py-2.5 text-sm">
                <span className="zl-grad-bg size-1.5 shrink-0 rounded-full" />
                {f}
              </li>
            ))}
          </ul>
          <ZButton href="/register" className="mt-8 w-fit">
            {service.cta}
          </ZButton>
        </div>
      </div>
    </Reveal>
  );
}

const SFX = ["Thunder rolling over hills", "Footsteps on wet gravel", "Sci-fi door, heavy hiss", "Crowd cheering, stadium"];

export function VoiceSection() {
  return (
    <section id="voice" className="scroll-mt-24 px-5 py-24 sm:py-32">
      <SectionHeading
        eyebrow="AI Voice & Audio"
        title={
          <>
            Any voice. Any language.
            <br />
            <span className="zl-serif zl-grad-text">Studio clean.</span>
          </>
        }
        sub="Generate natural speech, re-voice recordings, design sound effects, transcribe, clean and dub. Six tools, one account."
      />

      <div className="mx-auto mt-16 grid max-w-7xl gap-5 lg:grid-cols-3">
        <Card service={byId("voice-generator")} className="lg:col-span-2">
          <VoiceOrbs />
        </Card>
        <Card service={byId("voice-changer")} delay={0.08}>
          <div className="flex flex-col gap-3">
            <div className="rounded-2xl bg-(--zl-surface-2) px-4 py-3 text-(--zl-muted)/70">
              <p className="mb-2 text-xs font-medium">Your recording</p>
              <Wave seed={5} bars={32} className="h-10" />
            </div>
            <LuArrowRightLeft className="mx-auto size-5 rotate-90 text-(--zl-muted)" />
            <div className="rounded-2xl bg-(--zl-surface-2) px-4 py-3 text-[#ff3d86]">
              <p className="mb-2 text-xs font-medium">Target voice, same timing</p>
              <Wave seed={5} bars={32} className="h-10" />
            </div>
          </div>
        </Card>

        <Card service={byId("sound-effects")}>
          <div className="flex flex-col gap-2">
            {SFX.map((s, i) => (
              <div key={s} className="flex items-center gap-3 rounded-xl bg-(--zl-surface-2) px-3 py-2.5">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--zl-text) text-(--zl-bg)">
                  <LuPlay className="size-3 translate-x-[1px] fill-current" />
                </span>
                <span className="flex-1 truncate text-sm">{s}</span>
                <Wave seed={i + 2} bars={12} className="h-5 w-16 text-(--zl-muted)/60" />
              </div>
            ))}
          </div>
        </Card>
        <Card service={byId("speech-to-text")} delay={0.08}>
          <Transcript />
        </Card>
        <Card service={byId("audio-cleaner")} delay={0.16}>
          <Cleaner />
        </Card>

        <DubbingCard />
      </div>
    </section>
  );
}
