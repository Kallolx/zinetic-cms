"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { LuArrowRight } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/lib/studio/tools";
import { MediaBg } from "@/components/studio/media";

const FEATURED = ["music", "avatar-video", "voice", "video-translation"]
  .map((id) => TOOLS.find((t) => t.id === id)!)
  .filter(Boolean);

export function HomeHero({ name }: { name: string }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % FEATURED.length), 6500);
    return () => clearInterval(t);
  }, []);
  const tool = FEATURED[i];
  const Icon = tool.icon;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-zinc-900 ring-1 ring-white/10">
      <AnimatePresence mode="sync">
        <motion.div
          key={tool.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 -z-10"
        >
          <MediaBg media={tool.media} />
        </motion.div>
      </AnimatePresence>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="flex min-h-[22rem] flex-col justify-end gap-6 p-7 sm:min-h-[26rem] sm:p-12">
        <div>
          <p className="text-sm text-white/70">{name ? `Welcome back, ${name.split(" ")[0]}` : "Welcome back"}</p>
          <h1 className="mt-2 max-w-2xl font-heading text-4xl leading-[1.05] font-bold text-balance sm:text-6xl">
            What will you <span className="zl-serif zl-grad-text">create</span> today?
          </h1>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-4"
          >
            <span className={cn("flex size-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg [&_svg]:size-5", tool.accent)}>
              <Icon />
            </span>
            <div className="mr-2">
              <p className="font-semibold">{tool.name}</p>
              <p className="text-sm text-white/65">{tool.blurb}</p>
            </div>
            <Link
              href={tool.href!}
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
            >
              Try it now
              <LuArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-2">
          {FEATURED.map((t, n) => (
            <button
              key={t.id}
              type="button"
              aria-label={t.name}
              onClick={() => setI(n)}
              className={cn("h-1 cursor-pointer rounded-full transition-all", n === i ? "w-10 bg-white" : "w-4 bg-white/35")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
