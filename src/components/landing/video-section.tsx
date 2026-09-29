"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { LuScissors, LuSparkles, LuWandSparkles } from "react-icons/lu";
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

function CardHead({ service }: { service: Service }) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3 className="zl-display text-2xl font-semibold sm:text-[1.7rem]">{service.name}</h3>
        <span className="shrink-0 rounded-full bg-(--zl-surface-2) px-2.5 py-1 text-xs font-medium text-(--zl-muted)">
          {fromPrice(service)}
        </span>
      </div>
      <p className="mt-3 text-(--zl-muted)">{service.blurb}</p>
    </>
  );
}

function Cta({ service }: { service: Service }) {
  return (
    <ZLink href="/register" className="mt-6">
      {service.cta}
    </ZLink>
  );
}

function Shell({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={className}>
      <div className="group flex h-full flex-col rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-7 transition-colors hover:border-(--zl-text)/20">
        {children}
      </div>
    </Reveal>
  );
}

function AvatarStudio() {
  const s = byId("avatar-video");
  const avatars = [MEDIA.portraitWoman, MEDIA.bearded, MEDIA.pinkNeonPortrait, MEDIA.portraitCloseUp];
  return (
    <Reveal className="lg:col-span-3">
      <div className="group grid overflow-hidden rounded-[32px] border border-(--zl-line) bg-(--zl-surface) lg:grid-cols-[1fr_1.5fr]">
        <div className="flex flex-col p-7 sm:p-10">
          <CardHead service={s} />
          <div className="mt-8 rounded-2xl border border-(--zl-line) bg-(--zl-bg) p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--zl-muted)">Script</p>
            <p className="mt-2 leading-relaxed">
              &ldquo;Hi, I&apos;m Maya. This month we&apos;re launching three new plans, and I&apos;ll walk you
              through each one in under a minute.&rdquo;
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-(--zl-muted)">Avatar</p>
            <div className="mt-2 flex gap-2">
              {avatars.map((a, i) => (
                <span
                  key={a}
                  className={cn(
                    "relative size-12 overflow-hidden rounded-xl",
                    i === 0 && "ring-2 ring-[#ff3d86] ring-offset-2 ring-offset-(--zl-bg)"
                  )}
                >
                  <Image src={a} alt="" fill sizes="48px" className="object-cover" />
                </span>
              ))}
            </div>
          </div>
          <div className="mt-auto pt-6">
            <ZButton href="/register" arrow={false} icon={<LuWandSparkles className="size-4" />}>
              {s.cta}
            </ZButton>
          </div>
        </div>
        <div className="relative min-h-[320px] lg:min-h-[520px]">
          <AutoVideo src={MEDIA.womanTalking} />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-(--zl-surface)/30" />
          <div className="absolute right-5 bottom-5 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
            <span className="size-2 animate-pulse rounded-full bg-[#ff3d86]" /> 1080p · Rendering from script
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function PortraitVideo({ src, chip, caption }: { src: string; chip: string; caption?: string }) {
  return (
    <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-2xl">
      <AutoVideo src={src} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black">
        {chip}
      </span>
      {caption && (
        <p className="absolute inset-x-3 bottom-3 rounded-lg bg-black/55 px-3 py-2 text-center text-sm font-medium text-white backdrop-blur-md">
          {caption}
        </p>
      )}
    </div>
  );
}

function ShortClips() {
  const s = byId("short-clips");
  const clips = [
    { src: MEDIA.concertLights, len: "0:32" },
    { src: MEDIA.djPurple, len: "0:45" },
    { src: MEDIA.neonMaleSinger, len: "0:28" },
  ];
  return (
    <Reveal className="lg:col-span-3">
      <div className="group grid gap-10 rounded-[32px] border border-(--zl-line) bg-(--zl-surface) p-7 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <CardHead service={s} />
          <div className="mt-8">
            <p className="mb-2 text-xs font-medium text-(--zl-muted)">Source video · 42:18</p>
            <div className="relative h-10 overflow-hidden rounded-lg bg-(--zl-surface-2)">
              {[12, 41, 73].map((left, i) => (
                <motion.span
                  key={left}
                  className="zl-grad-bg absolute inset-y-1 rounded-md"
                  style={{ left: `${left}%` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "9%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.3, duration: 0.6 }}
                />
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-(--zl-muted)">
              <LuScissors className="size-3.5" /> 3 highlights found
            </p>
          </div>
          <Cta service={s} />
        </div>
        <div className="flex justify-center gap-3 sm:gap-5">
          {clips.map((c, i) => (
            <motion.div
              key={c.src}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: i === 1 ? -24 : 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-[9/16] w-[30%] max-w-[190px] overflow-hidden rounded-[22px] border-4 border-(--zl-text)/90 shadow-2xl"
            >
              <AutoVideo src={c.src} />
              <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                {c.len}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

const FILLER = [
  { w: "So", f: false },
  { w: "um,", f: true },
  { w: "today", f: false },
  { w: "we're", f: false },
  { w: "uh,", f: true },
  { w: "going", f: false },
  { w: "to", f: false },
  { w: "like,", f: true },
  { w: "look", f: false },
  { w: "at", f: false },
  { w: "the", f: false },
  { w: "you know,", f: true },
  { w: "new", f: false },
  { w: "release.", f: false },
];

function FillerDemo() {
  return (
    <div className="mt-6 rounded-2xl bg-(--zl-surface-2) p-5 text-lg leading-loose">
      {FILLER.map((t, i) => (
        <span key={i} className="relative mr-1.5 inline-block">
          <span className={t.f ? "text-(--zl-muted)" : ""}>{t.w}</span>
          {t.f && (
            <motion.span
              className="absolute top-1/2 left-0 h-[2px] bg-[#ff3d86]"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.3 }}
            />
          )}
        </span>
      ))}
      <p className="mt-3 text-xs font-medium text-(--zl-muted)">4 filler words and 2 long pauses removed</p>
    </div>
  );
}

function AvatarCreatorDemo() {
  return (
    <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-2xl">
      <Image src={MEDIA.portraitWoman} alt="" fill sizes="400px" className="object-cover" />
      <motion.div
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#ff3d86]/40 to-transparent"
        animate={{ top: ["-20%", "100%"] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
        <LuSparkles className="size-3.5" /> Building your avatar
      </span>
    </div>
  );
}

function PromptVideoDemo() {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="rounded-2xl bg-(--zl-surface-2) px-4 py-3 text-sm">
        A camera operator on a neon-lit set, slow push-in, cinematic
      </div>
      <div className="relative aspect-video overflow-hidden rounded-2xl">
        <Image src={MEDIA.cameraLights} alt="" fill sizes="400px" className="object-cover" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

export function VideoSection() {
  const translation = byId("video-translation");
  const tlLipSync = byId("translation-lipsync");
  const lipSync = byId("lip-sync");
  const filler = byId("filler-remover");
  const avatarCreator = byId("avatar-creator");
  const promptVideo = byId("prompt-to-video");

  return (
    <section id="video" className="scroll-mt-24 px-5 py-24 sm:py-32">
      <SectionHeading
        eyebrow="AI Video"
        title={
          <>
            Put it on screen.
            <br />
            <span className="text-(--zl-muted)">In every</span> <span className="zl-serif zl-grad-text">language.</span>
          </>
        }
        sub="Avatars that present your script, translations in the speaker's own voice, lips that match the new audio, and Shorts cut from your long videos."
      />

      <div className="mx-auto mt-16 grid max-w-7xl gap-5 lg:grid-cols-3">
        <AvatarStudio />

        <Shell>
          <CardHead service={translation} />
          <PortraitVideo src={MEDIA.manTalking} chip="English → বাংলা" caption="আজ আমরা নতুন অ্যালবাম নিয়ে কথা বলব।" />
          <Cta service={translation} />
        </Shell>
        <Shell delay={0.08}>
          <CardHead service={tlLipSync} />
          <PortraitVideo src={MEDIA.headphonesCloseUp} chip="Lips re-synced" caption="Hola, gracias por escuchar." />
          <Cta service={tlLipSync} />
        </Shell>
        <Shell delay={0.16}>
          <CardHead service={lipSync} />
          <PortraitVideo src={MEDIA.neonSinger} chip="New vocal track" />
          <Cta service={lipSync} />
        </Shell>

        <ShortClips />

        <Shell>
          <CardHead service={filler} />
          <FillerDemo />
          <Cta service={filler} />
        </Shell>
        <Shell delay={0.08}>
          <CardHead service={avatarCreator} />
          <AvatarCreatorDemo />
          <Cta service={avatarCreator} />
        </Shell>
        <Shell delay={0.16}>
          <CardHead service={promptVideo} />
          <PromptVideoDemo />
          <Cta service={promptVideo} />
        </Shell>
      </div>
    </section>
  );
}
