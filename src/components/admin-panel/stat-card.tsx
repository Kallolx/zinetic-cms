import Link from "next/link";
import { LuArrowDownRight, LuArrowUpRight } from "react-icons/lu";
import { cn } from "@/lib/utils";
import { Sparkline } from "@/components/admin-panel/charts";

/** A headline number with how it moved and, optionally, a small trend. */
export function StatCard({
  label,
  value,
  sub,
  delta,
  invertDelta = false,
  spark,
  href,
  icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /** change against the previous period, in percent */
  delta?: number | null;
  /** true when a rise is bad (failures, for example) */
  invertDelta?: boolean;
  spark?: number[];
  href?: string;
  icon?: React.ReactNode;
  tone?: "default" | "attention";
}) {
  const good = delta == null ? null : invertDelta ? delta <= 0 : delta >= 0;
  const body = (
    <div
      className={cn(
        "group flex h-full flex-col justify-between gap-4 rounded-xl border bg-card p-5 transition-colors",
        href && "hover:bg-accent/40",
        tone === "attention" && "border-amber-500/40 bg-amber-500/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon && <span className="text-muted-foreground [&_svg]:size-4.5">{icon}</span>}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-3xl leading-none font-semibold tabular-nums">{value}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {delta != null && (
              <span className={cn("inline-flex items-center gap-0.5 font-medium", good ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
                {delta >= 0 ? <LuArrowUpRight className="size-3.5" /> : <LuArrowDownRight className="size-3.5" />}
                {Math.abs(Math.round(delta))}%
              </span>
            )}
            {sub}
          </p>
        </div>
        {spark && <Sparkline values={spark} />}
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
