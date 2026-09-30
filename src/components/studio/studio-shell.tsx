"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuClock, LuFolderOpen, LuHouse, LuLifeBuoy, LuLogOut, LuMenu, LuUserRoundX, LuX } from "react-icons/lu";
import { signOut } from "@/app/actions/auth";
import { stopImpersonating } from "@/app/actions/admin";
import { cn } from "@/lib/utils";
import { GROUPS, TOOLS } from "@/lib/studio/tools";
import { formatCredits } from "@/lib/credits";

function Row({ href, active, onNavigate, children }: { href: string; active: boolean; onNavigate: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors",
        active ? "bg-white/10 font-medium text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      {children}
    </Link>
  );
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const chip = "flex size-7 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4";

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <Link href="/studio" onClick={onNavigate} className="flex items-center gap-2.5 px-1.5 pt-1">
        <Image src="/brand/logo.png" alt="" width={899} height={1140} style={{ height: 30, width: "auto" }} />
        <span className="leading-tight">
          <span className="block font-heading text-[0.95rem] font-semibold">Zinetic Music</span>
          <span className="zl-grad-text block text-xs font-semibold">AI Studio</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        <Row href="/studio" active={pathname === "/studio"} onNavigate={onNavigate}>
          <span className={cn(chip, "bg-white/10")}><LuHouse /></span> Home
        </Row>
        <Row href="/studio/library" active={pathname === "/studio/library"} onNavigate={onNavigate}>
          <span className={cn(chip, "bg-white/10")}><LuFolderOpen /></span> Library
        </Row>
      </nav>

      {GROUPS.map((g) => (
        <nav key={g.id} className="flex flex-col gap-0.5">
          <p className="px-2.5 pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/35">{g.label}</p>
          {TOOLS.filter((t) => t.group === g.id).map((t) => {
            const Icon = t.icon;
            const tile = <span className={cn(chip, "bg-gradient-to-br text-white", t.accent)}><Icon /></span>;
            return t.href ? (
              <Row key={t.id} href={t.href} active={pathname === t.href} onNavigate={onNavigate}>
                {tile} {t.name}
              </Row>
            ) : (
              <div key={t.id} className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-white/30">
                <span className="opacity-40">{tile}</span>
                <span className="flex-1">{t.name}</span>
                <LuClock className="size-3.5" />
              </div>
            );
          })}
        </nav>
      ))}

      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
        <Row href="/dashboard/support" active={false} onNavigate={onNavigate}>
          <span className={cn(chip, "bg-white/10")}><LuLifeBuoy /></span> Support
        </Row>
      </div>
    </div>
  );
}

function TopBar({ userName, userEmail, balance, impersonating }: { userName: string; userEmail: string; balance?: number; impersonating: boolean }) {
  const pathname = usePathname();
  const tool = TOOLS.find((t) => t.href === pathname);
  const title = pathname === "/studio" ? "Home" : pathname === "/studio/library" ? "Library" : (tool?.name ?? "AI Studio");
  const label = userName || userEmail;

  return (
    <header className="sticky top-0 z-20 hidden h-16 items-center justify-between gap-4 border-b border-white/10 bg-[#08070a]/80 px-8 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/45">AI Studio</span>
        <span className="text-white/25">/</span>
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-3">
        {typeof balance === "number" && (
          <span className="flex h-9 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-sm ring-1 ring-white/10">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="text-white/60">Balance</span>
            <span className="font-medium">{formatCredits(balance)}</span>
          </span>
        )}
        <Link href="/dashboard/support" className="flex h-9 items-center gap-2 rounded-full px-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white">
          <LuLifeBuoy className="size-4" /> Support
        </Link>
        <form action={impersonating ? stopImpersonating : signOut} className="flex items-center gap-2 rounded-full bg-white/[0.06] py-1 pr-1 pl-1 ring-1 ring-white/10">
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 text-xs font-semibold">
            {label.slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden max-w-40 truncate text-sm xl:block">{label}</span>
          <button
            type="submit"
            aria-label={impersonating ? "Stop impersonating" : "Sign out"}
            title={impersonating ? "Stop impersonating" : "Sign out"}
            className="flex size-7 cursor-pointer items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-white"
          >
            {impersonating ? <LuUserRoundX className="size-4" /> : <LuLogOut className="size-4" />}
          </button>
        </form>
      </div>
    </header>
  );
}

export function StudioShell({
  children,
  userName,
  userEmail,
  balance,
  impersonating = false,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  balance?: number;
  impersonating?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const close = () => setOpen(false);
  const props = { onNavigate: close };

  return (
    <div className="zl dark min-h-screen bg-[#08070a] text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#0b0a0f] lg:block">
        <Sidebar {...props} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/10 bg-[#0b0a0f]/90 px-4 backdrop-blur lg:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="flex size-9 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10">
          <LuMenu className="size-5" />
        </button>
        <Link href="/studio" className="flex items-center gap-2">
          <Image src="/brand/logo.png" alt="" width={899} height={1140} style={{ height: 24, width: "auto" }} />
          <span className="font-heading text-sm font-semibold">AI Studio</span>
        </Link>
        <form action={impersonating ? stopImpersonating : signOut} className="ml-auto">
          <button type="submit" aria-label="Sign out" className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white">
            {impersonating ? <LuUserRoundX className="size-5" /> : <LuLogOut className="size-5" />}
          </button>
        </form>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={close} className="absolute inset-0 bg-black/70" />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-white/10 bg-[#0b0a0f]">
            <button type="button" aria-label="Close" onClick={close} className="absolute top-3 right-3 z-10 flex size-8 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10">
              <LuX className="size-4" />
            </button>
            <Sidebar {...props} />
          </div>
        </div>
      )}

      <main className="lg:pl-64">
        <TopBar userName={userName} userEmail={userEmail} balance={balance} impersonating={impersonating} />
        {impersonating && (
          <p className="bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-200">You are viewing this dashboard as a customer.</p>
        )}
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
