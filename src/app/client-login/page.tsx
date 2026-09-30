import Link from "next/link";
import Image from "next/image";
import {
  LuArrowLeft,
  LuAudioLines,
  LuClapperboard,
  LuClock,
  LuDisc3,
  LuLifeBuoy,
  LuMail,
} from "react-icons/lu";
import Aurora from "@/components/aurora";
import { ZButton } from "@/components/landing/button";
import { Reveal } from "@/components/landing/primitives";
import { displayFont, serifFont } from "@/components/landing/fonts";
import { TicketStatus } from "@/components/landing/ticket-status";

export const metadata = {
  title: "Client Login | Zinetic Music",
  description: "Choose the Zinetic Music dashboard you want to open.",
};

type Dashboard = {
  name: string;
  description: string;
  logo: React.ReactNode;
  href?: string;
};

const DASHBOARDS: Dashboard[] = [
  {
    name: "Music Distribution",
    description: "Releases, royalties and analytics.",
    logo: (
      <span className="flex size-16 shrink-0 sm:size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899]">
        <LuDisc3 className="size-8 text-white sm:size-10" />
      </span>
    ),
  },
  {
    name: "AI Studio",
    description: "Voice, audio and video: dubbing, avatars, translation, lip sync and clips.",
    logo: (
      <span className="relative flex size-16 shrink-0 sm:size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2563eb] via-[#7c3aed] to-[#f97316]">
        <LuAudioLines className="size-7 -translate-x-1.5 -translate-y-1 text-white sm:size-9 sm:-translate-x-2" />
        <LuClapperboard className="absolute size-5 translate-x-3 translate-y-3 text-white/90 sm:size-7 sm:translate-x-4 sm:translate-y-3.5" />
      </span>
    ),
  },
  {
    name: "Channel Checker",
    description: "YouTube MCN checker and copyright management (Content Manager).",
    href: "/login",
    logo: (
      <span className="flex size-16 shrink-0 sm:size-20 items-center justify-center rounded-3xl bg-[#c2185b] shadow-[0_16px_40px_-14px_rgb(194_24_91/0.85)]">
        <Image src="/brand/logo-slideBar.png" alt="" width={52} height={52} className="size-10 sm:size-[52px]" />
      </span>
    ),
  },
];

function HelpDesk({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby={className?.includes("md:hidden") ? "help-desk-mobile" : "help-desk"}
      className={`relative overflow-hidden rounded-3xl border border-white/15 bg-black/35 p-5 backdrop-blur-xl sm:p-6 ${className ?? ""}`}
    >
      <div aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-[#ff3d86]/25 blur-3xl" />
      <div className="relative flex items-start gap-4">
        <span className="zl-grad-bg flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_12px_30px_-12px_rgb(255_61_134/0.8)]">
          <LuLifeBuoy className="size-6" />
        </span>
        <div className="min-w-0">
          <h2 id={className?.includes("md:hidden") ? "help-desk-mobile" : "help-desk"} className="font-heading text-xl font-bold">
            Help Desk
          </h2>
          <p className="mt-1 text-sm text-white/65">Questions about a dashboard, your account or an order? Write to us.</p>
          <a
            href="mailto:support@zineticmusic.com"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-[#ff3d86] underline-offset-4"
          >
            <LuMail className="size-4" /> support@zineticmusic.com
          </a>
        </div>
      </div>

      <div className="relative mt-6 border-t border-white/10 pt-5">
        <h3 className="font-semibold">Check Support Status</h3>
        <p className="mt-1 mb-4 text-sm text-white/60">Enter the ticket ID from your submission confirmation.</p>
        <TicketStatus />
      </div>
    </section>
  );
}

export default function ClientLoginPage() {
  return (
    <div className={`zl dark ${displayFont.variable} ${serifFont.variable} grid min-h-screen grid-cols-1 md:grid-cols-2`}>
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0f0f0f] p-10 text-white md:sticky md:top-0 md:flex md:h-screen">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-90">
          <Aurora colorStops={["#3d8bff", "#9b4dff", "#ff3d86"]} amplitude={1.2} blend={0.6} speed={0.8} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-2/5 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <Image src="/brand/logo.png" alt="" width={899} height={1140} style={{ height: 40, width: "auto" }} />
          <span className="font-heading text-lg font-semibold">Zinetic Music</span>
        </Link>

        <div className="relative z-10 flex flex-col gap-7">
          <div className="flex w-fit items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/80">
            <Image src="/brand/logo.png" alt="" width={899} height={1140} style={{ height: 20, width: "auto" }} />
            One account, every dashboard
          </div>
          <h2 className="font-heading text-4xl leading-tight font-bold text-balance">
            Music, AI and creator tools, all in one place
          </h2>
          <HelpDesk />
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Zinetic Music. All rights reserved.
        </p>
      </div>

      <div className="flex min-w-0 flex-col bg-zinc-950 text-white">
        <header className="flex items-center gap-3 px-6 py-5">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex size-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LuArrowLeft className="size-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2.5 md:hidden">
            <Image src="/brand/logo.png" alt="" width={899} height={1140} style={{ height: 30, width: "auto" }} />
            <span className="font-heading text-base font-semibold">Zinetic Music</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-lg">
            <Reveal>
              <h1 className="font-heading text-3xl font-bold">Client login</h1>
              <p className="mt-2 text-white/60">Choose the dashboard you want to open.</p>
            </Reveal>

            <ul className="mt-8 flex flex-col gap-3.5">
              {DASHBOARDS.map((d, i) => {
                const locked = !d.href;
                return (
                  <li key={d.name}>
                    <Reveal delay={0.08 + i * 0.07}>
                      <div
                        className={
                          locked
                            ? "flex items-center gap-4 rounded-3xl border border-white/8 bg-white/[0.02] p-4 sm:gap-5 sm:p-5"
                            : "flex items-center gap-4 rounded-3xl border border-white/15 bg-white/[0.06] p-4 sm:gap-5 sm:p-5 shadow-[0_24px_60px_-34px_rgb(255_61_134/0.55)]"
                        }
                      >
                        <span className={locked ? "opacity-45 saturate-50" : ""}>{d.logo}</span>
                        <div className="min-w-0 flex-1">
                          <p className={locked ? "text-lg font-semibold text-white/60" : "text-lg font-semibold"}>{d.name}</p>
                          <p className={locked ? "mt-0.5 text-sm text-white/35" : "mt-0.5 text-sm text-white/60"}>
                            {d.description}
                          </p>
                        </div>
                        {locked ? (
                          <span
                            aria-disabled
                            className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/45"
                          >
                            <LuClock className="size-3.5" /> Soon
                          </span>
                        ) : (
                          <ZButton href={d.href!} size="sm" className="shrink-0">
                            Open
                          </ZButton>
                        )}
                      </div>
                    </Reveal>
                  </li>
                );
              })}
            </ul>

            <Reveal delay={0.35}>
              <HelpDesk className="mt-8 md:hidden" />
            </Reveal>

            <Reveal delay={0.4}>
              <p className="mt-8 text-center text-sm text-white/50">
                New here?{" "}
                <Link href="/register" className="font-medium text-white underline decoration-[#ff3d86] underline-offset-4">
                  Create an account
                </Link>
              </p>
            </Reveal>
          </div>
        </main>
      </div>
    </div>
  );
}
