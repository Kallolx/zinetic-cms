import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { LuShieldCheck, LuMail, LuChartBar, LuArrowLeft } from "react-icons/lu";

const points = [
  { icon: LuShieldCheck, text: "Instantly check which network a channel belongs to" },
  { icon: LuMail, text: "Get the network's contact email in seconds" },
  { icon: LuChartBar, text: "Track every check, claim, and wallet transaction in one place" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-[2fr_3fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0f0f0f] p-10 text-white md:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 20% 10%, oklch(0.55 0.2 262.881 / 60%), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 90%, oklch(0.65 0.2 47.604 / 45%), transparent 60%)",
          }}
        />
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <Image
            src="/brand/logo.png"
            alt=""
            width={899}
            height={1140}
            style={{ height: 40, width: "auto" }}
          />
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

      <div className="flex flex-col bg-muted/40">
        <header className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Back to home"
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <LuArrowLeft className="size-5" />
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#c2185b]">
                <Image src="/brand/logo-slideBar.png" alt="" width={26} height={26} />
              </div>
              <span className="hidden font-heading text-base font-semibold sm:block">
                Content Manager
              </span>
            </Link>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
