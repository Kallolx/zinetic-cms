"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuFolderOpen, LuHouse, LuLifeBuoy, LuLogOut, LuMenu, LuUserRoundX, LuX } from "react-icons/lu";
import { signOut } from "@/app/actions/auth";
import { stopImpersonating } from "@/app/actions/admin";
import { cn } from "@/lib/utils";
import { GROUPS, TOOLS } from "@/lib/studio/tools";
import { formatCredits } from "@/lib/credits";

// One neutral style for every item: quiet icon, light text, a soft highlight and a thin bar when active.
function Row({ href, active, onNavigate, icon, children }: { href: string; active: boolean; onNavigate: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-[7px] text-[0.8125rem] transition-colors [&_svg]:size-[1.05rem] [&_svg]:shrink-0",
        active ? "bg-white/[0.08] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white"
      )}
    >
      {active && <span aria-hidden className="absolute top-1/2 left-0 h-4 w-[2px] -translate-y-1/2 rounded-full bg-white" />}
      <span className={cn("transition-colors", active ? "text-white" : "text-white/40 group-hover:text-white/80")}>{icon}</span>
      {children}
    </Link>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1.5 text-[0.68rem] font-medium tracking-wide text-white/30">{children}</p>;
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <Link href="/studio" onClick={onNavigate} className="flex items-center gap-2.5 px-3">
        <Image src="/brand/logo.png" alt="" width={899} height={1140} style={{ height: 28, width: "auto" }} />
        <span className="font-heading text-[0.95rem] font-semibold">
          Zinetic <span className="font-normal text-white/50">Studio</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        <Row href="/studio" active={pathname === "/studio"} onNavigate={onNavigate} icon={<LuHouse />}>Home</Row>
        <Row href="/studio/library" active={pathname === "/studio/library"} onNavigate={onNavigate} icon={<LuFolderOpen />}>Library</Row>
      </nav>

      {GROUPS.map((g) => (
        <nav key={g.id} className="flex flex-col gap-0.5">
          <Label>{g.label}</Label>
          {TOOLS.filter((t) => t.group === g.id).map((t) => {
            const Icon = t.icon;
            return t.href ? (
              <Row key={t.id} href={t.href} active={pathname === t.href} onNavigate={onNavigate} icon={<Icon />}>
                {t.name}
              </Row>
            ) : (
              <div key={t.id} className="flex items-center gap-3 px-3 py-[7px] text-[0.8125rem] text-white/25 [&_svg]:size-[1.05rem]">
                <Icon />
                <span className="flex-1">{t.name}</span>
                <span className="text-[0.65rem]">Soon</span>
              </div>
            );
          })}
        </nav>
      ))}

      <div className="mt-auto border-t border-white/10 pt-4">
        <Row href="/dashboard/support" active={false} onNavigate={onNavigate} icon={<LuLifeBuoy />}>Support</Row>
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
