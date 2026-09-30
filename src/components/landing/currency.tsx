"use client";

import * as React from "react";
import { formatMoney, periodSuffix, type Currency } from "@/lib/currency";
import type { Service } from "@/lib/landing-services";
import { cn } from "@/lib/utils";

const KEY = "zl-currency";
const listeners = new Set<() => void>();

function read(): Currency {
  try {
    return localStorage.getItem(KEY) === "BDT" ? "BDT" : "USD";
  } catch {
    return "USD";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function write(c: Currency) {
  try {
    localStorage.setItem(KEY, c);
  } catch {
    // storage unavailable: the choice just lasts until the tab closes
  }
  listeners.forEach((l) => l());
}

export function useCurrency() {
  const currency = React.useSyncExternalStore(subscribe, read, () => "USD" as Currency);
  return { currency, setCurrency: write, other: (currency === "USD" ? "BDT" : "USD") as Currency };
}

export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div
      role="group"
      aria-label="Currency"
      className={cn("flex items-center rounded-full border border-white/15 bg-white/[0.06] p-0.5 text-xs font-semibold", className)}
    >
      {(["USD", "BDT"] as const).map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          aria-pressed={currency === c}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors",
            currency === c ? "bg-white text-black" : "text-white/70 hover:text-white"
          )}
        >
          {c === "USD" ? "$ USD" : "৳ BDT"}
        </button>
      ))}
    </div>
  );
}

const SIZES = {
  xl: "text-[2.6rem]",
  lg: "text-xl",
  md: "text-lg",
  sm: "text-base",
} as const;

/** Chosen currency large, the other currency small underneath. */
export function PriceBlock({
  usd,
  period,
  size = "xl",
  align = "left",
  className,
}: {
  usd: number;
  period?: "year" | "month" | "avatar" | null;
  size?: keyof typeof SIZES;
  align?: "left" | "right";
  className?: string;
}) {
  const { currency, other } = useCurrency();
  return (
    <div className={cn(align === "right" && "text-right", className)}>
      <p className={cn("flex flex-wrap items-baseline gap-x-1", align === "right" && "justify-end")}>
        <span className={cn("zl-display font-bold", SIZES[size])}>{formatMoney(usd, currency)}</span>
        <span className="text-sm opacity-60">{periodSuffix(period)}</span>
      </p>
      <p className="mt-0.5 text-xs opacity-60">≈ {formatMoney(usd, other)}</p>
    </div>
  );
}

/** Inline text version: "$12.99/year · ৳1,585" */
export function PriceText({
  usd,
  period,
  prefix,
  className,
}: {
  usd: number;
  period?: "year" | "month" | "avatar" | null;
  prefix?: string;
  className?: string;
}) {
  const { currency, other } = useCurrency();
  return (
    <span className={className}>
      {prefix}
      {formatMoney(usd, currency)}
      {periodSuffix(period)} <span className="opacity-60">· {formatMoney(usd, other)}</span>
    </span>
  );
}

export function FromPrice({ service, className }: { service: Service; className?: string }) {
  const min = service.tiers.reduce((a, b) => (b.price < a.price ? b : a));
  return <PriceText usd={min.price} period={min.period} prefix="From " className={className} />;
}
