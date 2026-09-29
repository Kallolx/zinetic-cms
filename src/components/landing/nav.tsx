"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LuArrowUpRight, LuMenu } from "react-icons/lu";
import { cn } from "@/lib/utils";

export const LANDING_LINKS = [
  { label: "Music", href: "#music" },
  { label: "Voice & Audio", href: "#voice" },
  { label: "Video", href: "#video" },
  { label: "Creator Tools", href: "#creator-tools" },
  { label: "Pricing", href: "#pricing" },
];

export function LandingNav() {
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
          "mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-full px-3 py-2 transition-all duration-500 sm:px-5",
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
            <SheetContent side="left" className="zl w-[85vw] max-w-sm border-(--zl-line) p-6">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <Logo size={30} />
              <nav className="mt-10 flex flex-col gap-1">
                {LANDING_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="zl-display py-2 text-3xl font-semibold"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="mt-10 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="rounded-full border border-(--zl-line) py-3 text-center text-sm font-semibold"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="zl-grad-bg rounded-full py-3 text-center text-sm font-semibold text-white"
                >
                  Start creating
                </Link>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/" aria-label="Zinetic Music home">
            <Logo size={30} />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {LANDING_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-(--zl-muted) transition-colors hover:text-(--zl-text)"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold sm:block"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="zl-grad-bg group flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgb(255_60_110/0.7)] transition-transform hover:scale-[1.03]"
          >
            Start creating
            <LuArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
