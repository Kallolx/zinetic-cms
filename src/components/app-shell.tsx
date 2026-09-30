"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LuMenu,
  LuLogOut,
  LuWallet,
  LuSearch,
  LuCircleHelp,
  LuChevronsUpDown,
  LuChevronDown,
  LuUserRoundX,
} from "react-icons/lu";
import { signOut } from "@/app/actions/auth";
import { stopImpersonating } from "@/app/actions/admin";
import { onWalletBalance } from "@/lib/wallet-store";
import { formatCredits } from "@/lib/credits";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** submenu: the parent expands to show these, and opens by itself when one is active */
  children?: NavItem[];
  /** shown greyed out with a "Soon" tag, not clickable */
  soon?: boolean;
};

const linkClass = (active: boolean, collapsed?: boolean) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors [&_svg]:size-5 [&_svg]:shrink-0",
    collapsed && "justify-center px-2",
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

function NavGroup({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const children = item.children ?? [];
  const childActive = children.some((c) => pathname === c.href);
  // null = follow the route (open while a child is active), once clicked = the user's choice
  const [manual, setManual] = React.useState<boolean | null>(null);
  const open = manual ?? childActive;

  if (collapsed) {
    return (
      <Link
        href={children[0]?.href ?? item.href}
        onClick={onNavigate}
        title={item.label}
        className={linkClass(childActive, true)}
      >
        {item.icon}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setManual(!open)}
        aria-expanded={open}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors [&_svg]:size-5 [&_svg]:shrink-0",
          childActive ? "text-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        <LuChevronDown className={cn("!size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 ml-[1.35rem] flex flex-col gap-0.5 border-l pl-3">
          {children.map((c) => {
            const active = pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                onClick={onNavigate}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavLinks({
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        if (item.children) {
          return (
            <NavGroup key={item.label} item={item} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
          );
        }
        if (item.soon) {
          return (
            <div
              key={item.label}
              title={collapsed ? `${item.label} (soon)` : undefined}
              className={cn(
                "flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/50 [&_svg]:size-5 [&_svg]:shrink-0",
                collapsed && "justify-center px-2"
              )}
            >
              {item.icon}
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[0.65rem] uppercase tracking-wider">Soon</span>
                </>
              )}
            </div>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={linkClass(pathname === item.href, collapsed)}
          >
            {item.icon}
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarLogoutButton({
  collapsed,
  impersonating,
}: {
  collapsed?: boolean;
  impersonating?: boolean;
}) {
  return (
    <form action={impersonating ? stopImpersonating : signOut}>
      <button
        type="submit"
        title={collapsed ? (impersonating ? "Stop impersonating" : "Sign out") : undefined}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        {impersonating ? (
          <LuUserRoundX className="size-5 shrink-0" />
        ) : (
          <LuLogOut className="size-5 shrink-0" />
        )}
        {!collapsed && (impersonating ? "Stop impersonating" : "Sign out")}
      </button>
    </form>
  );
}

function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get("q") ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/dashboard?q=${encodeURIComponent(q)}` : "/dashboard");
  }

  return (
    <form onSubmit={onSubmit} className="hidden w-full max-w-lg md:block">
      <div className="relative">
        <LuSearch className="absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search for your content"
          className="h-11 rounded-full bg-muted/60 pl-11 text-[0.95rem]"
        />
      </div>
    </form>
  );
}

export function AppShell({
  children,
  navItems,
  secondaryNavItems,
  userName,
  userEmail,
  walletBalance,
  title,
  impersonating = false,
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  secondaryNavItems?: NavItem[];
  userName: string;
  userEmail: string;
  walletBalance?: number;
  roleLabel: string;
  title: string;
  impersonating?: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [balance, setBalance] = React.useState(walletBalance);

  React.useEffect(() => onWalletBalance(setBalance), []);

  const sidebarContent = (collapsedMode: boolean) => (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <div className={cn("flex flex-col items-center gap-1 pt-2 text-center", collapsedMode && "gap-0")}>
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-[#c2185b]",
            collapsedMode ? "size-11" : "size-24"
          )}
        >
          <Image
            src="/brand/logo-slideBar.png"
            alt="Content Manager"
            width={collapsedMode ? 22 : 80}
            height={collapsedMode ? 22 : 80}
          />
        </div>
        {!collapsedMode && (
          <>
            <p className="mt-2 font-heading text-base font-semibold">Content Manager</p>
            <p className="w-full truncate px-2 text-xs text-muted-foreground">
              {userName || userEmail}
            </p>
          </>
        )}
      </div>
      <NavLinks items={navItems} pathname={pathname} collapsed={collapsedMode} />
      <div className="mt-auto flex flex-col gap-3">
        {secondaryNavItems && secondaryNavItems.length > 0 && (
          <NavLinks items={secondaryNavItems} pathname={pathname} collapsed={collapsedMode} />
        )}
        {typeof balance === "number" && (
          <Link
            href="/dashboard/wallet"
            className={cn(
              "flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-3 transition-colors hover:bg-accent",
              collapsedMode && "justify-center px-2"
            )}
            title={collapsedMode ? `Wallet: ${formatCredits(balance)}` : undefined}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LuWallet className="size-5" />
              {!collapsedMode && "Wallet"}
            </div>
            {!collapsedMode && (
              <span className="font-heading font-semibold">{formatCredits(balance)}</span>
            )}
          </Link>
        )}
        <SidebarLogoutButton collapsed={collapsedMode} impersonating={impersonating} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-[72px] w-full shrink-0 items-center gap-3 border-b bg-sidebar px-4 md:px-5">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-lg" className="md:hidden">
                <LuMenu className="size-6" />
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            {sidebarContent(false)}
          </SheetContent>
        </Sheet>

        <Button
          variant="ghost"
          size="icon-lg"
          className="hidden md:inline-flex"
          onClick={() => setCollapsed((v) => !v)}
          aria-label="Toggle sidebar"
        >
          <LuMenu className="size-6" />
        </Button>

        <div className="flex shrink-0 items-center gap-2">
          <Image
            src="/brand/logo.png"
            alt=""
            width={899}
            height={1140}
            style={{ height: 30, width: "auto" }}
            className="hidden dark:block"
          />
          <Image
            src="/brand/logo-black.png"
            alt=""
            width={899}
            height={1140}
            style={{ height: 30, width: "auto" }}
            className="block dark:hidden"
          />
          <h1 className="hidden font-heading text-lg font-semibold sm:block">{title}</h1>
        </div>

        <div className="flex flex-1 justify-center">
          <React.Suspense fallback={<div className="hidden w-full max-w-lg md:block" />}>
            <HeaderSearch />
          </React.Suspense>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {typeof balance === "number" && (
            <Link href="/dashboard/wallet" className="hidden sm:block">
              <Badge
                variant="secondary"
                className="h-9 gap-1.5 rounded-full px-3 text-sm transition-colors hover:bg-secondary/70"
              >
                <LuWallet className="size-4" />
                {formatCredits(balance)}
              </Badge>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-lg"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/dashboard/support" aria-label="Help" />}
          >
            <LuCircleHelp className="size-5" />
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex h-12 max-w-[220px] items-center gap-2 rounded-xl border bg-muted/40 py-1.5 pr-3 pl-1.5 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#c2185b]">
                    <Image
                      src="/brand/logo-slideBar.png"
                      alt=""
                      width={40}
                      height={40}
                    />
                  </div>
                  <p className="hidden max-w-[130px] truncate text-sm font-medium md:block">
                    {userName || userEmail}
                  </p>
                  <LuChevronsUpDown className="hidden size-4 shrink-0 text-muted-foreground md:block" />
                </button>
              }
            />
            <DropdownMenuContent align="end">
              <div className="px-1.5 py-1.5">
                {userName && <p className="truncate text-sm font-medium">{userName}</p>}
                <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                render={
                  <form action={impersonating ? stopImpersonating : signOut} className="w-full">
                    <button type="submit" className="flex w-full items-center gap-1.5 cursor-pointer">
                      {impersonating ? (
                        <LuUserRoundX className="size-4" />
                      ) : (
                        <LuLogOut className="size-4" />
                      )}
                      {impersonating ? "Stop impersonating" : "Sign out"}
                    </button>
                  </form>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {impersonating && (
        <div className="sticky top-[72px] z-40 flex items-center justify-center gap-3 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
          <span>
            You&apos;re viewing as <strong>{userName || userEmail}</strong> as an admin. Actions
            here affect their real account.
          </span>
          <form action={stopImpersonating}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full bg-amber-950/10 px-2.5 py-1 text-xs font-semibold hover:bg-amber-950/20"
            >
              <LuUserRoundX className="size-3.5" />
              Stop impersonating
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-1">
        <aside
          className={cn(
            "sticky top-[72px] hidden h-[calc(100vh-72px)] shrink-0 self-start overflow-y-auto border-r bg-sidebar transition-[width] duration-200 md:block",
            collapsed ? "w-20" : "w-64"
          )}
        >
          {sidebarContent(collapsed)}
        </aside>

        <main className="flex-1 bg-background p-4 md:p-8">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
