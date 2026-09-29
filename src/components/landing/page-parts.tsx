"use client";

import * as React from "react";
import { motion } from "motion/react";
import { LuArrowUpRight } from "react-icons/lu";
import { Eyebrow, Reveal } from "@/components/landing/primitives";
import { ZButton } from "@/components/landing/button";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  sub,
  meta,
  aside,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  meta?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden px-5 pt-36 pb-16 sm:pt-44 sm:pb-24", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-30%] h-[60vh] w-[85vw] -translate-x-1/2 rounded-full bg-(--zl-glow-a) blur-[120px]" />
        <div className="absolute left-[6%] top-[30%] h-[40vh] w-[35vw] rounded-full bg-(--zl-glow-c) blur-[120px]" />
        <div className="absolute right-[4%] top-[35%] h-[40vh] w-[32vw] rounded-full bg-(--zl-glow-b) blur-[120px]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-(--zl-bg)" />
      </div>
      <div
        className={cn(
          "mx-auto grid max-w-7xl items-center gap-12",
          aside ? "lg:grid-cols-[1.15fr_1fr]" : ""
        )}
      >
        <div className="min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Eyebrow>{eyebrow}</Eyebrow>
          </motion.div>
          <motion.h1
            className="zl-display mt-6 text-[clamp(2.4rem,6.2vw,5rem)] font-bold"
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {title}
          </motion.h1>
          {sub && (
            <motion.p
              className="mt-6 max-w-2xl text-base leading-relaxed text-(--zl-muted) sm:text-lg"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {sub}
            </motion.p>
          )}
          {meta && (
            <motion.div
              className="mt-7"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {meta}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div
            className="min-w-0"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {aside}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export type DocSection = { id: string; title: string; body: React.ReactNode };

function Toc({ items }: { items: { id: string; title: string }[] }) {
  const [active, setActive] = React.useState(items[0]?.id);

  React.useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="min-w-0 lg:sticky lg:top-28">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-(--zl-muted)">On this page</p>
      <ol className="mt-4 flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {items.map((item, i) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className={cn(
                "group flex items-center gap-3 rounded-full border px-3.5 py-2 text-sm transition-all duration-300 lg:rounded-xl lg:border-transparent lg:px-3",
                active === item.id
                  ? "border-(--zl-text)/25 bg-(--zl-surface) font-semibold text-(--zl-text) lg:border-(--zl-line)"
                  : "border-(--zl-line) text-(--zl-muted) hover:text-(--zl-text) lg:border-transparent"
              )}
            >
              <span
                className={cn(
                  "hidden size-1.5 shrink-0 rounded-full transition-all lg:block",
                  active === item.id ? "zl-grad-bg scale-125" : "bg-(--zl-line)"
                )}
              />
              <span className="tabular-nums text-xs opacity-60 lg:hidden">{String(i + 1).padStart(2, "0")}</span>
              <span className="whitespace-nowrap lg:whitespace-normal">{item.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LegalDoc({
  sections,
  contactEmail = "info@zineticmusic.com",
}: {
  sections: DocSection[];
  contactEmail?: string;
}) {
  return (
    <section className="px-5 pb-24 sm:pb-32">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <Toc items={sections.map((s) => ({ id: s.id, title: s.title }))} />

        <div className="flex min-w-0 max-w-3xl flex-col gap-5">
          {sections.map((s, i) => (
            <Reveal key={s.id} y={20}>
              <article
                id={s.id}
                className="scroll-mt-28 rounded-[26px] border border-(--zl-line) bg-(--zl-surface) p-6 sm:p-9"
              >
                <div className="flex items-baseline gap-4">
                  <span className="zl-display zl-grad-text text-3xl font-bold tabular-nums sm:text-4xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="zl-display text-xl font-semibold sm:text-2xl">{s.title}</h2>
                </div>
                <div className="mt-5 space-y-3 text-[0.95rem] leading-[1.8] text-(--zl-muted) sm:text-base sm:leading-[1.8] [&_strong]:text-(--zl-text) [&_li]:pl-1 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-[#ff3d86]">
                  {s.body}
                </div>
              </article>
            </Reveal>
          ))}

          <Reveal y={20}>
            <div className="relative isolate overflow-hidden rounded-[26px] border border-(--zl-line) p-7 sm:p-9">
              <div aria-hidden className="absolute -right-10 -bottom-16 -z-10 size-64 rounded-full bg-(--zl-glow-a) blur-[80px]" />
              <p className="zl-display text-2xl font-semibold sm:text-3xl">Still have a question?</p>
              <p className="mt-2 max-w-lg text-(--zl-muted)">
                Write to us and we&apos;ll get back to you as soon as possible.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ZButton href={`mailto:${contactEmail}`} arrow="up-right">
                  {contactEmail}
                </ZButton>
                <ZButton href="/contact" variant="outline" arrow={false}>
                  Contact page
                </ZButton>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FactCard({
  icon,
  label,
  children,
  href,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const inner = (
    <div
      className={cn(
        "group relative flex h-full flex-col gap-4 overflow-hidden rounded-[24px] border border-(--zl-line) bg-(--zl-surface) p-6 transition-all duration-500 hover:-translate-y-1 hover:border-(--zl-text)/20 hover:shadow-[0_24px_60px_-30px_rgb(255_61_134/0.45)]",
        className
      )}
    >
      <span className="zl-grad-bg flex size-11 items-center justify-center rounded-xl text-white shadow-[0_10px_24px_-10px_rgb(255_61_134/0.7)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-(--zl-muted)">{label}</p>
        <div className="mt-1.5 break-words text-base font-medium leading-snug sm:text-lg">{children}</div>
      </div>
      {href && (
        <LuArrowUpRight className="absolute top-5 right-5 size-5 text-(--zl-muted) transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff3d86]" />
      )}
    </div>
  );
  return href ? (
    <a href={href} className="block h-full">
      {inner}
    </a>
  ) : (
    inner
  );
}
