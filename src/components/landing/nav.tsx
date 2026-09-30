"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LuArrowUpRight, LuChevronDown, LuMail, LuMenu } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { ZButton } from "@/components/landing/button";
import { displayFont, serifFont } from "@/components/landing/fonts";
import { CATEGORIES, servicesIn } from "@/lib/landing-services";
import { CurrencyToggle, FromPrice } from "@/components/landing/currency";
import { serviceHref } from "@/lib/service-pages";

const LINKS = [
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const linkClass =
  "rounded-full px-4 py-2 text-[1.02rem] font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white";

function MegaMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full left-1/2 mt-3 w-[min(1120px,calc(100vw-2rem))] -translate-x-1/2"
    >
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0910]/95 p-3 text-white shadow-[0_40px_100px_-30px_rgb(0_0_0/0.8)] backdrop-blur-2xl">
        <div className="grid gap-1 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <div key={c.id} className="rounded-2xl p-4">
              <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-white/50">
                <span className="zl-grad-bg size-1.5 rounded-full" />
                {c.label}
              </p>
              <ul className="mt-3 flex flex-col">
                {servicesIn(c.id).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={serviceHref(s.id)}
                      onClick={onNavigate}
                      className="group flex items-start justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/10"
                    >
                      <span className="min-w-0">
                        <span className="block text-[0.95rem] font-medium leading-snug text-white/95 group-hover:text-white">
                          {s.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-white/45">
                          <FromPrice service={s} />
                        </span>
                      </span>
                      <LuArrowUpRight className="mt-1 size-4 shrink-0 -translate-x-1 text-white/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-[#ff5b8a]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-1 flex items-center justify-between gap-4 rounded-2xl bg-white/[0.06] px-5 py-3.5">
          <p className="text-sm text-white/60">17 services across music, voice, video and creator tools.</p>
          <Link href="/services" onClick={onNavigate} className="zl-link text-white">
            Browse all services
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function LandingNav() {
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [mobileServices, setMobileServices] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  const openMenu = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  }, []);
  const closeMenuSoon = React.useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 140);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close menus after navigating to another page
    setMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <div
        className={cn(
          "relative mx-auto flex max-w-7xl items-center justify-between gap-2 rounded-full border px-2.5 py-2 text-white backdrop-blur-xl transition-all duration-500 sm:px-5",
          scrolled
            ? "border-white/12 bg-[#0b0910]/85 shadow-[0_18px_50px_-20px_rgb(0_0_0/0.7)]"
            : "border-white/10 bg-[#0b0910]/60"
        )}
      >
        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <button
                  type="button"
                  aria-label="Open menu"
                  className="flex size-10 items-center justify-center rounded-full text-white lg:hidden"
                />
              }
            >
              <LuMenu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className={`zl dark ${displayFont.variable} ${serifFont.variable} flex w-[88vw] max-w-sm flex-col gap-0 overflow-hidden border-(--zl-line) bg-(--zl-bg) p-0`}
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
                <div className="absolute -top-24 -left-16 size-72 rounded-full bg-(--zl-glow-a) blur-[90px]" />
                <div className="absolute -right-20 bottom-24 size-64 rounded-full bg-(--zl-glow-b) blur-[90px]" />
              </div>

              <div className="relative flex items-center border-b border-(--zl-line) px-6 py-5">
                <Logo size={30} />
              </div>

              <nav className="relative flex flex-1 flex-col overflow-y-auto px-6 py-2">
                <div className="border-b border-(--zl-line)">
                  <button
                    type="button"
                    onClick={() => setMobileServices((v) => !v)}
                    aria-expanded={mobileServices}
                    className="flex w-full items-center justify-between py-4"
                  >
                    <span className="zl-display text-[1.7rem] font-semibold">Services</span>
                    <LuChevronDown
                      className={cn("size-5 text-(--zl-muted) transition-transform duration-300", mobileServices && "rotate-180")}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileServices && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-5 pb-5">
                          {CATEGORIES.map((c) => (
                            <div key={c.id}>
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--zl-muted)">
                                {c.label}
                              </p>
                              <ul className="mt-2 flex flex-col">
                                {servicesIn(c.id).map((s) => (
                                  <li key={s.id}>
                                    <Link
                                      href={serviceHref(s.id)}
                                      onClick={() => setSheetOpen(false)}
                                      className="block py-2 text-[1.02rem] font-medium"
                                    >
                                      {s.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          <Link href="/services" onClick={() => setSheetOpen(false)} className="zl-link">
                            Browse all services
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setSheetOpen(false)}
                    className="group flex items-center gap-4 border-b border-(--zl-line) py-4"
                  >
                    <span className="zl-display flex-1 text-[1.7rem] font-semibold transition-transform duration-500 group-hover:translate-x-1">
                      {l.label}
                    </span>
                    <LuArrowUpRight className="size-5 text-(--zl-muted) transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#ff3d86]" />
                  </Link>
                ))}
              </nav>

              <div className="relative flex flex-col gap-3 border-t border-(--zl-line) px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-(--zl-muted)">Currency</span>
                  <CurrencyToggle />
                </div>
                <ZButton href="/client-login" variant="outline" arrow={false} className="w-full" onClick={() => setSheetOpen(false)}>
                  Log in
                </ZButton>
                <ZButton href="/client-login" className="w-full" onClick={() => setSheetOpen(false)}>
                  Start now
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
            <Logo size={30} tone="light" />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          <div onMouseEnter={openMenu} onMouseLeave={closeMenuSoon} onFocus={openMenu} onBlur={closeMenuSoon}>
            <button
              type="button"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className={cn(linkClass, "flex items-center gap-1.5", menuOpen && "bg-white/10 text-white")}
            >
              Services
              <LuChevronDown className={cn("size-4 transition-transform duration-300", menuOpen && "rotate-180")} />
            </button>
            <AnimatePresence>{menuOpen && <MegaMenu onNavigate={() => setMenuOpen(false)} />}</AnimatePresence>
          </div>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <CurrencyToggle className="hidden sm:flex" />
          <span className="hidden md:block">
            <ZButton href="/client-login" variant="glass" size="sm" arrow={false}>
              Log in
            </ZButton>
          </span>
          <ZButton href="/client-login" size="sm" arrow="up-right">
            Start now
          </ZButton>
        </div>
      </div>
    </motion.header>
  );
}
