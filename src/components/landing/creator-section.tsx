"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useInView } from "motion/react";
import { LuArrowRight, LuCheck, LuMail, LuNetwork, LuSearch } from "react-icons/lu";
import { Eyebrow, Reveal } from "@/components/landing/primitives";
import { SERVICES } from "@/lib/landing-services";
import { CHECK_PRICE } from "@/lib/pricing-plans";

const mcn = SERVICES.find((s) => s.id === "mcn-checker")!;
const QUERY = "youtube.com/@yourfavouritechannel";

function LookupMock() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [typed, setTyped] = React.useState("");
  const done = typed.length === QUERY.length;

  React.useEffect(() => {
    if (!inView || done) return;
    const t = setTimeout(() => setTyped(QUERY.slice(0, typed.length + 1)), 45);
    return () => clearTimeout(t);
  }, [inView, typed, done]);

  return (
    <div
      ref={ref}
      className="rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-5 shadow-[0_40px_120px_-50px_rgb(0_0_0/0.6)] sm:p-7"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-(--zl-line) bg-(--zl-bg) px-4 py-3.5">
        <LuSearch className="size-5 shrink-0 text-(--zl-muted)" />
        <span className="flex-1 truncate font-mono text-sm">
          {typed}
          {!done && <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] bg-[#ff3d86]" />}
        </span>
        <span className="zl-grad-bg rounded-full px-3 py-1.5 text-xs font-semibold text-white">Check</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={done ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 rounded-2xl bg-(--zl-surface-2) p-5"
      >
        <div className="flex items-center gap-3">
          <span className="zl-grad-bg flex size-12 items-center justify-center rounded-full text-lg font-bold text-white">
            Y
          </span>
          <div>
            <p className="font-semibold">Your Favourite Channel</p>
            <p className="text-xs text-(--zl-muted)">UC · 2.1M subscribers</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Found
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-(--zl-surface) p-3.5">
            <p className="flex items-center gap-1.5 text-xs text-(--zl-muted)">
              <LuNetwork className="size-3.5" /> Network / CMS
            </p>
            <p className="mt-1 font-semibold">Example Media Network</p>
          </div>
          <div className="rounded-xl bg-(--zl-surface) p-3.5">
            <p className="flex items-center gap-1.5 text-xs text-(--zl-muted)">
              <LuMail className="size-3.5" /> Contact email
            </p>
            <p className="mt-1 truncate font-semibold">partners@example.com</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function CreatorSection() {
  return (
    <section id="creator-tools" className="scroll-mt-24 px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <Eyebrow>Creator Tools</Eyebrow>
          <h2 className="zl-display mt-5 text-[clamp(2.4rem,5.2vw,4.6rem)] font-semibold">
            Know who owns <span className="zl-serif zl-grad-text">any</span> YouTube channel.
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--zl-muted)">
            Paste a channel link and see which MCN or CMS network it belongs to, with the network&apos;s
            contact email. Built for labels and rights managers who need to reach the right people
            fast.
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {mcn.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <LuCheck className="size-4 text-[#ff5b4a]" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="zl-grad-bg inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
            >
              {mcn.cta} <LuArrowRight className="size-4" />
            </Link>
            <p className="text-sm text-(--zl-muted)">
              ${CHECK_PRICE} per check, down to less with credit bundles
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <LookupMock />
        </Reveal>
      </div>
    </section>
  );
}
