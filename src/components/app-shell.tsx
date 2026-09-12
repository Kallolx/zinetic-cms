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
import { LuMenu, LuLogOut, LuWallet, LuSearch, LuCircleHelp, LuChevronsUpDown } from "react-icons/lu";
import { signOut } from "@/app/actions/auth";
import { onWalletBalance } from "@/lib/wallet-store";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};


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
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors [&_svg]:size-5 [&_svg]:shrink-0",
              collapsed && "justify-center px-2",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {item.icon}
            {!collapsed && item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarLogoutButton({ collapsed }: { collapsed?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        title={collapsed ? "Sign out" : undefined}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <LuLogOut className="size-5 shrink-0" />
        {!collapsed && "Sign out"}
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
}: {
  children: React.ReactNode;
  navItems: NavItem[];
  secondaryNavItems?: NavItem[];
  userName: string;
  userEmail: string;
  walletBalance?: number;
  roleLabel: string;
  title: string;
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
            title={collapsedMode ? `Wallet: $${balance.toFixed(2)}` : undefined}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LuWallet className="size-5" />
              {!collapsedMode && "Wallet"}
            </div>
            {!collapsedMode && (
              <span className="font-heading font-semibold">${balance.toFixed(2)}</span>
            )}
          </Link>
        )}
        <SidebarLogoutButton collapsed={collapsedMode} />
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
            height={935}
            style={{ height: 30, width: "auto" }}
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
                <LuWallet className="size-4" />${balance.toFixed(2)}
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
                  <form action={signOut} className="w-full">
                    <button type="submit" className="flex w-full items-center gap-1.5 cursor-pointer">
                      <LuLogOut className="size-4" />
                      Sign out
                    </button>
                  </form>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={cn(
            "sticky top-[72px] hidden h-[calc(100vh-72px)] shrink-0 self-start overflow-y-auto border-r bg-sidebar transition-[width] duration-200 md:block",
            collapsed ? "w-20" : "w-64"
          )}
        >
          {sidebarContent(collapsed)}
        </aside>

        <main className="flex-1 bg-background p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
