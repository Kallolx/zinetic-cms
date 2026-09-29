"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LuMenu } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { ZButton } from "@/components/landing/button";

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
                <ZButton href="/login" variant="outline" arrow={false} onClick={() => setOpen(false)}>
                  Log in
                </ZButton>
                <ZButton href="/register" onClick={() => setOpen(false)}>
                  Start creating
                </ZButton>
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
          <ZButton href="/login" variant="outline" size="sm" arrow={false} className="hidden sm:inline-flex">
            Log in
          </ZButton>
          <ZButton href="/register" size="sm" arrow="up-right">
            Start creating
          </ZButton>
        </div>
      </div>
    </motion.header>
  );
}
