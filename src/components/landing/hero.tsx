"use client";

import * as React from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { LuMusic, LuMic, LuClapperboard, LuGlobe, LuPlus } from "react-icons/lu";
import { HeroOrbit } from "@/components/landing/hero-orbit";
import { cn } from "@/lib/utils";
import { ZButton } from "@/components/landing/button";

const MODES = [
  {
    id: "music",
    label: "Music",
    icon: LuMusic,
    prompts: [
      "A slow Bangla love song, acoustic guitar, soft female vocal",
      "Lo-fi beat with rain, vinyl crackle, 82 BPM",
      "Cinematic trailer score that builds to a huge drop",
    ],
  },
  {
    id: "voice",
    label: "Voice",
    icon: LuMic,
    prompts: [
      "Read my podcast intro in a warm, confident male voice",
      "Dub this interview from English into Bangla",
      "Remove the traffic noise from my voice memo",
    ],
  },
  {
    id: "video",
    label: "Video",
    icon: LuClapperboard,
    prompts: [
      "Turn this 40-minute podcast into 10 vertical Shorts",
      "Translate my product video into Hindi and sync the lips",
      "An avatar presenting my script in a studio, 1080p",
    ],
  },
  {
    id: "release",
    label: "Release",
    icon: LuGlobe,
    prompts: [
      "Release my new single on every major streaming platform",
      "Distribute my label's catalogue and keep 90% royalties",
    ],
  },
];

function TypedPrompt({ lines }: { lines: string[] }) {
  const [text, setText] = React.useState("");
  const [lineIndex, setLineIndex] = React.useState(0);
  const reduce = useReducedMotion();
  const full = lines[lineIndex % lines.length];

  React.useEffect(() => {
    if (reduce) return;
    if (text.length < full.length) {
      const t = setTimeout(() => setText(full.slice(0, text.length + 1)), 32);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setText("");
      setLineIndex((i) => i + 1);
    }, 2200);
    return () => clearTimeout(t);
  }, [text, full, reduce]);

  return (
    <p className="flex-1 text-base text-(--zl-text) sm:text-lg">
      {reduce ? full : text}
      <span
        className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-[#ff3d86]"
        style={{ animation: "zl-caret 1s steps(1) infinite" }}
      />
    </p>
  );
}

export function Hero() {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [mode, setMode] = React.useState(MODES[0]);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-18%] h-[70vh] w-[90vw] -translate-x-1/2 rounded-full bg-(--zl-glow-a) blur-[120px]" />
        <div className="absolute left-[8%] top-[35%] h-[45vh] w-[45vw] rounded-full bg-(--zl-glow-c) blur-[120px]" />
        <div className="absolute right-[5%] top-[40%] h-[50vh] w-[40vw] rounded-full bg-(--zl-glow-b) blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-(--zl-bg)" />
      </div>

      <HeroOrbit />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-5 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--zl-line) bg-(--zl-surface)/60 px-4 py-1.5 text-xs font-medium text-(--zl-muted) backdrop-blur-md"
        >
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[#ff3d86] opacity-60" />
            <span className="relative size-2 rounded-full bg-[#ff3d86]" />
          </span>
          Music distribution, AI voice and AI video in one studio
        </motion.div>

        <h1 className="zl-display text-[clamp(2.4rem,6vw,5.25rem)] font-bold">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            Make it heard.
          </motion.span>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            Make it <span className="zl-serif zl-grad-text pr-2 text-[1.08em]">seen.</span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-xl text-base leading-relaxed text-(--zl-muted) sm:text-lg"
        >
          Release your music to the world and keep up to 90% of the royalties. Generate songs,
          voices and sound. Dub, translate and lip-sync video. All from one Zinetic account.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 w-full max-w-2xl"
        >
          <div className="rounded-[28px] border border-(--zl-line) bg-(--zl-surface)/75 p-2.5 text-left shadow-[0_40px_120px_-40px_rgb(0_0_0/0.55)] backdrop-blur-2xl">
            <div className="flex min-h-[74px] items-start gap-3 px-4 pt-3.5 pb-2">
              <TypedPrompt key={mode.id} lines={mode.prompts} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 px-1.5 pb-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex size-9 items-center justify-center rounded-full border border-(--zl-line) text-(--zl-muted)">
                  <LuPlus className="size-4" />
                </span>
                {MODES.map((m) => {
                  const Icon = m.icon;
                  const active = m.id === mode.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        "zl-chip flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium",
                        active
                          ? "border-transparent bg-(--zl-text) text-(--zl-bg)"
                          : "border-(--zl-line) text-(--zl-muted) hover:text-(--zl-text)"
                      )}
                    >
                      <Icon className="size-4" />
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <ZButton href="/register" size="sm">
                Create
              </ZButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
