import Link from "next/link";
import Image from "next/image";
import {
  LuArrowLeft,
  LuAudioLines,
  LuChartBar,
  LuClapperboard,
  LuDisc3,
  LuClock,
  LuMail,
  LuShieldCheck,
} from "react-icons/lu";
import Aurora from "@/components/aurora";
import { ZButton } from "@/components/landing/button";
import { Reveal } from "@/components/landing/primitives";
import { displayFont, serifFont } from "@/components/landing/fonts";

export const metadata = {
  title: "Client Login | Zinetic Music",
  description: "Choose the Zinetic Music dashboard you want to open.",
};

const points = [
  { icon: LuShieldCheck, text: "Instantly check which network a channel belongs to" },
  { icon: LuMail, text: "Get the network's contact email in seconds" },
  { icon: LuChartBar, text: "Track every check, claim, and wallet transaction in one place" },
];

type Dashboard = {
  name: string;
  description: string;
  logo: React.ReactNode;
  href?: string;
};

const DASHBOARDS: Dashboard[] = [
  {
    name: "Content Manager",
    description: "YouTube MCN checker and copyright management.",
    href: "/login",
    logo: (
      <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-[#c2185b] shadow-[0_16px_40px_-14px_rgb(194_24_91/0.85)]">
        <Image src="/brand/logo-slideBar.png" alt="" width={52} height={52} />
      </span>
    ),
  },
  {
    name: "Music Distribution",
    description: "Releases, royalties and analytics.",
    logo: (
      <span className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7c3aed] to-[#ec4899]">
        <LuDisc3 className="size-10 text-white" />
      </span>
    ),
  },
  {
    name: "AI Studio",
    description: "Voice, audio and video: dubbing, avatars, translation, lip sync and clips.",
    logo: (
      <span className="relative flex size-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2563eb] via-[#7c3aed] to-[#f97316]">
        <LuAudioLines className="size-9 -translate-x-2 -translate-y-1 text-white" />
        <LuClapperboard className="absolute size-7 translate-x-4 translate-y-3.5 text-white/90" />
      </span>
    ),
  },
];

export default function ClientLoginPage() {
  return (
    <div className={`zl dark ${displayFont.variable} ${serifFont.variable} grid min-h-screen md:grid-cols-2`}>
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0f0f0f] p-10 text-white md:flex">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-90">
          <Aurora colorStops={["#3d8bff", "#9b4dff", "#ff3d86"]} amplitude={1.2} blend={0.6} speed={0.8} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-2/5 bg-gradient-to-t from-[#0f0f0f] to-transparent" />
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <Image src="/brand/logo.png" alt="" width={899} height={1140} style={{ height: 40, width: "auto" }} />
          <span className="font-heading text-lg font-semibold">Zinetic Music</span>
        </Link>

        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex w-fit items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/80">
            <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                fill="#FF0000"
              />
              <polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#FFFFFF" />
            </svg>
            Built for YouTube
          </div>
          <h2 className="font-heading text-4xl leading-tight font-bold text-balance">
            YouTube MCN Checker &amp; Copyright Management
          </h2>
          <ul className="flex flex-col gap-4">
            {points.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-white/80">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <p.icon className="size-4" />
                </div>
                <span className="text-[0.95rem] leading-relaxed">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} Zinetic Music. All rights reserved.
        </p>
      </div>

      <div className="flex flex-col bg-zinc-950 text-white">
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
                            ? "flex items-center gap-5 rounded-3xl border border-white/8 bg-white/[0.02] p-5"
                            : "flex items-center gap-5 rounded-3xl border border-white/15 bg-white/[0.06] p-5 shadow-[0_24px_60px_-34px_rgb(255_61_134/0.55)]"
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
