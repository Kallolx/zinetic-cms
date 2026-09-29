"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LuArrowUpRight, LuMail, LuMenu } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { ZButton } from "@/components/landing/button";
import { displayFont, serifFont } from "@/components/landing/fonts";

export const LANDING_LINKS = [
  { label: "Music", href: "#music" },
  { label: "Voice & Audio", href: "#voice" },
  { label: "Video", href: "#video" },
  { label: "Creator Tools", href: "#creator-tools" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav({ base = "" }: { base?: string }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full px-2.5 py-2 transition-all duration-500 sm:px-5",
          scrolled
            ? "border border-(--zl-line) bg-(--zl-bg)/70 shadow-[0_10px_40px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl"
            : "border border-transparent"
        )}
      >
        <div className="flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  aria-label="Open menu"
                  className="flex size-10 items-center justify-center rounded-full lg:hidden"
                />
              }
            >
              <LuMenu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className={`zl ${displayFont.variable} ${serifFont.variable} flex w-[88vw] max-w-sm flex-col gap-0 overflow-hidden border-(--zl-line) bg-(--zl-bg) p-0`}
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
                <div className="absolute -top-24 -left-16 size-72 rounded-full bg-(--zl-glow-a) blur-[90px]" />
                <div className="absolute -right-20 bottom-24 size-64 rounded-full bg-(--zl-glow-b) blur-[90px]" />
              </div>

              <div className="relative flex items-center border-b border-(--zl-line) px-6 py-5">
                <Logo size={30} />
              </div>

              <nav className="relative flex flex-1 flex-col overflow-y-auto px-6 py-4">
                {LANDING_LINKS.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={base + l.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.08 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="group flex items-center gap-4 border-b border-(--zl-line) py-4"
                  >
                    <span className="zl-display flex-1 text-[1.7rem] font-semibold transition-transform duration-500 group-hover:translate-x-1">
                      {l.label}
                    </span>
                    <LuArrowUpRight className="size-5 text-(--zl-muted) transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff3d86]" />
                  </motion.a>
                ))}
              </nav>

              <div className="relative flex flex-col gap-3 border-t border-(--zl-line) px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-(--zl-muted)">Appearance</span>
                  <ThemeToggle />
                </div>
                <ZButton href="/login" variant="outline" arrow={false} className="w-full" onClick={() => setOpen(false)}>
                  Log in
                </ZButton>
                <ZButton href="/register" className="w-full" onClick={() => setOpen(false)}>
                  Start Now
                </ZButton>
                <a
                  href="mailto:info@zineticmusic.com"
                  className="mt-1 flex items-center justify-center gap-2 text-xs text-(--zl-muted)"
                >
                  <LuMail className="size-3.5" /> info@zineticmusic.com
                </a>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" aria-label="Zinetic Music home" className="shrink-0">
            <Logo size={30} />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {LANDING_LINKS.map((l) => (
            <a
              key={l.href}
              href={base + l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-(--zl-muted) transition-colors hover:text-(--zl-text)"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <span className="hidden sm:block">
            <ZButton href="/login" variant="outline" size="sm" arrow={false}>
              Log in
            </ZButton>
          </span>
          <ZButton href="/register" size="sm" arrow="up-right">
            Start now
          </ZButton>
        </div>
      </div>
    </motion.header>
  );
}
