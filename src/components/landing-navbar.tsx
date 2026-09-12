"use client";

import * as React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LuArrowRight, LuMenu } from "react-icons/lu";

export interface NavLink {
  label: string;
  href: string;
}

export function LandingNavbar({ navLinks }: { navLinks: NavLink[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 dark:bg-card/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Left Section: Mobile Menu Trigger + Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile Hamburger Menu Trigger on LEFT */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Open mobile menu"
                />
              }
            >
              <LuMenu className="size-5" />
            </SheetTrigger>

            {/* Mobile Sidebar Menu Drawer on LEFT */}
            <SheetContent side="left" className="w-[85vw] max-w-xs p-6 flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <SheetHeader className="p-0 text-left border-b pb-4">
                  <SheetTitle>
                    <Logo size={32} />
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Menu Links */}
                <nav className="flex flex-col gap-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Navigation
                  </div>
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-base font-medium text-foreground hover:text-primary transition-colors py-1"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Mobile Sidebar Menu Footer Actions */}
              <div className="flex flex-col gap-3 border-t pt-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                  <ThemeToggle />
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  nativeButton={false}
                  onClick={() => setOpen(false)}
                  render={<Link href="/login">Sign in</Link>}
                />
                <Button
                  className="w-full justify-center gap-2"
                  nativeButton={false}
                  onClick={() => setOpen(false)}
                  render={
                    <Link href="/register">
                      <span>Get started</span>
                      <LuArrowRight className="size-4" />
                    </Link>
                  }
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Full Logo */}
          <Logo size={34} className="shrink-0" />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {/* Sign in - hidden on small mobile, visible on desktop or sm:flex */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            nativeButton={false}
            render={<Link href="/login">Sign in</Link>}
          />

          {/* 1 Primary Action Button - Always visible in header */}
          <Button
            size="sm"
            className="shadow-md text-xs sm:text-sm px-3 sm:px-4 h-9 whitespace-nowrap"
            nativeButton={false}
            render={
              <Link href="/register" className="flex items-center gap-1.5">
                <span>Get started</span>
                <LuArrowRight className="size-3.5" />
              </Link>
            }
          />
        </div>
      </div>
    </header>
  );
}
