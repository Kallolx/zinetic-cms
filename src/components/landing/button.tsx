import * as React from "react";
import Link from "next/link";
import { LuArrowRight, LuArrowUpRight } from "react-icons/lu";
import { cn } from "@/lib/utils";

type Variant = "primary" | "solid" | "outline" | "light";
type Size = "sm" | "md" | "lg";

function SwapArrow({ kind }: { kind: "right" | "up-right" }) {
  const Icon = kind === "right" ? LuArrowRight : LuArrowUpRight;
  return (
    <span className="zl-btn-icon" aria-hidden>
      <Icon />
      <Icon />
    </span>
  );
}

export function ZButton({
  href,
  variant = "primary",
  size = "md",
  arrow = "right",
  icon,
  className,
  children,
  onClick,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  arrow?: "right" | "up-right" | false;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const isHash = href.startsWith("#");
  const classes = cn("zl-btn", `zl-btn-${variant}`, `zl-btn-${size}`, className);
  const content = (
    <>
      {icon}
      {children}
      {arrow && <SwapArrow kind={arrow} />}
    </>
  );
  return isHash ? (
    <a href={href} className={classes} onClick={onClick}>
      {content}
    </a>
  ) : (
    <Link href={href} className={classes} onClick={onClick}>
      {content}
    </Link>
  );
}

export function ZLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn("zl-link", className)}>
      {children}
      <SwapArrow kind="right" />
    </Link>
  );
}
