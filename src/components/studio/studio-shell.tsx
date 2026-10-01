"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuChevronDown,
  LuFolderOpen,
  LuHouse,
  LuLifeBuoy,
  LuLogOut,
  LuMenu,
  LuPanelLeftClose,
  LuPanelLeftOpen,
  LuSearch,
  LuUserRoundX,
  LuX,
} from "react-icons/lu";
import { signOut } from "@/app/actions/auth";
import { stopImpersonating } from "@/app/actions/admin";
import { cn } from "@/lib/utils";
import { GROUPS, TOOLS, type StudioTool } from "@/lib/studio/tools";
import { formatCredits } from "@/lib/credits";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/* ------------------------------------------------ remembered on/off choices */

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const read = (key: string) => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

/** A true/false choice kept in this browser, so the sidebar stays how the customer left it. */
function useFlag(key: string) {
  const value = React.useSyncExternalStore(subscribe, () => read(key), () => false);
  const set = React.useCallback(
    (next: boolean) => {
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {}
      listeners.forEach((l) => l());
    },
    [key]
  );
  return [value, set] as const;
}

/* ----------------------------------------------------------------- sidebar */

type ItemProps = {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
};

function Item({ href, label, icon, active, collapsed, onNavigate }: ItemProps) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-lg text-[0.9375rem] transition-colors [&_svg]:size-5 [&_svg]:shrink-0",
        collapsed ? "mx-auto w-11 justify-center" : "px-3",
        active ? "bg-white/10 font-medium text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
      )}
    >
      {active && !collapsed && <span aria-hidden className="absolute top-1/2 -left-3 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />}
      <span className={cn("transition-colors", active ? "text-white" : "text-white/45 group-hover:text-white/85")}>{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function SoonItem({ tool, collapsed }: { tool: StudioTool; collapsed: boolean }) {
  const Icon = tool.icon;
  const row = (
    <div className={cn("flex h-10 items-center gap-3 text-[0.9375rem] text-white/30 [&_svg]:size-5", collapsed ? "mx-auto w-11 justify-center" : "px-3")}>
      <Icon />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{tool.name}</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.65rem]">Soon</span>
        </>
      )}
    </div>
  );
  if (!collapsed) return row;
  return (
    <Tooltip>
      <TooltipTrigger render={row} />
      <TooltipContent side="right">{tool.name} (soon)</TooltipContent>
    </Tooltip>
  );
}

function Group({ id, label, tools, collapsed, query, pathname, onNavigate }: { id: string; label: string; tools: StudioTool[]; collapsed: boolean; query: string; pathname: string; onNavigate: () => void }) {
  const [closed, setClosed] = useFlag(`studio-group-${id}-closed`);
  if (tools.length === 0) return null;
  // while searching, every group with a match stays open
  const open = query ? true : !closed;

  return (
    <div className="flex flex-col gap-0.5">
      {collapsed ? (
        <div className="mx-auto my-1 h-px w-6 bg-white/10" />
      ) : (
        <button
          type="button"
          onClick={() => setClosed(!closed)}
          aria-expanded={open}
          className="flex h-8 cursor-pointer items-center gap-2 px-3 text-[0.8125rem] font-medium text-white/45 transition-colors hover:text-white/80"
        >
          <span className="flex-1 text-left">{label}</span>
          <span className="text-xs tabular-nums text-white/30">{tools.length}</span>
          <LuChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} />
        </button>
      )}
      {(collapsed || open) &&
        tools.map((t) => {
          const Icon = t.icon;
          return t.href ? (
            <Item key={t.id} href={t.href} label={t.name} icon={<Icon />} active={pathname === t.href} collapsed={collapsed} onNavigate={onNavigate} />
          ) : (
            <SoonItem key={t.id} tool={t} collapsed={collapsed} />
          );
        })}
    </div>
  );
}

function Sidebar({ collapsed, onToggle, onNavigate, mobile = false }: { collapsed: boolean; onToggle: () => void; onNavigate: () => void; mobile?: boolean }) {
  const pathname = usePathname();
  const [query, setQuery] = React.useState("");
  const needle = query.trim().toLowerCase();
  const match = (t: StudioTool) => !needle || t.name.toLowerCase().includes(needle) || t.blurb.toLowerCase().includes(needle);
  const rail = collapsed && !mobile;

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 shrink-0 items-center", rail ? "justify-center" : "px-5")}>
        <Link href="/studio" onClick={onNavigate} className="flex items-center gap-3">
          <Image src="/brand/logo.png" alt="Zinetic Music" width={899} height={1140} style={{ height: 30, width: "auto" }} />
          {!rail && (
            <span className="font-heading text-base font-semibold">
              Zinetic <span className="font-normal text-white/50">Studio</span>
            </span>
          )}
        </Link>
      </div>

      <div className={cn("flex-1 overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", rail ? "px-2" : "px-3")}>
        {rail ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={onToggle}
                  aria-label="Search tools"
                  className="mx-auto mb-3 flex size-11 cursor-pointer items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
                />
              }
            >
              <LuSearch className="size-5" />
            </TooltipTrigger>
            <TooltipContent side="right">Search tools</TooltipContent>
          </Tooltip>
        ) : (
          <div className="relative mb-4">
            <LuSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools"
              aria-label="Search tools"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pr-3 pl-9 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/30"
            />
          </div>
        )}

        <nav className="flex flex-col gap-0.5">
          {!needle && (
            <>
              <Item href="/studio" label="Home" icon={<LuHouse />} active={pathname === "/studio"} collapsed={rail} onNavigate={onNavigate} />
              <Item href="/studio/library" label="Library" icon={<LuFolderOpen />} active={pathname === "/studio/library"} collapsed={rail} onNavigate={onNavigate} />
            </>
          )}
        </nav>

        <div className="mt-4 flex flex-col gap-3">
          {GROUPS.map((g) => (
            <Group key={g.id} id={g.id} label={g.label} tools={TOOLS.filter((t) => t.group === g.id && match(t))} collapsed={rail} query={needle} pathname={pathname} onNavigate={onNavigate} />
          ))}
          {needle && !TOOLS.some(match) && <p className="px-3 py-4 text-sm text-white/40">No tools match “{query}”.</p>}
        </div>
      </div>

      <div className={cn("shrink-0 border-t border-white/10 py-3", rail ? "px-2" : "px-3")}>
        <Item href="/dashboard/support" label="Support" icon={<LuLifeBuoy />} active={false} collapsed={rail} onNavigate={onNavigate} />
        {!mobile && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex h-10 cursor-pointer items-center gap-3 rounded-lg text-[0.9375rem] text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white [&_svg]:size-5",
              rail ? "mx-auto w-11 justify-center" : "w-full px-3"
            )}
          >
            {collapsed ? <LuPanelLeftOpen /> : <LuPanelLeftClose />}
            {!rail && <span>Collapse</span>}
          </button>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- top bar */

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
        <form action={impersonating ? stopImpersonating : signOut} className="flex items-center gap-2 rounded-full bg-white/[0.06] py-1 pr-1 pl-1 ring-1 ring-white/10">
          <span className="flex size-7 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">{label.slice(0, 1).toUpperCase()}</span>
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

/* ------------------------------------------------------------------- shell */

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
  const [collapsed, setCollapsed] = useFlag("studio-sidebar-collapsed");
  const close = () => setOpen(false);

  // Ctrl or Cmd + B collapses the sidebar, the same shortcut other editors use
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed(!read("studio-sidebar-collapsed"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCollapsed]);

  return (
    <div className="zl dark min-h-screen bg-[#08070a] text-white">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden border-r border-white/10 bg-[#0b0a0f] transition-[width] duration-200 lg:block",
          collapsed ? "w-[4.5rem]" : "w-72"
        )}
      >
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onNavigate={close} />
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
          <div className="absolute inset-y-0 left-0 w-80 max-w-[88vw] border-r border-white/10 bg-[#0b0a0f]">
            <button type="button" aria-label="Close" onClick={close} className="absolute top-3.5 right-3 z-10 flex size-9 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10">
              <LuX className="size-5" />
            </button>
            <Sidebar collapsed={false} onToggle={close} onNavigate={close} mobile />
          </div>
        </div>
      )}

      <main className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-[4.5rem]" : "lg:pl-72")}>
        <TopBar userName={userName} userEmail={userEmail} balance={balance} impersonating={impersonating} />
        {impersonating && (
          <p className="bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-200">You are viewing this dashboard as a customer.</p>
        )}
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
