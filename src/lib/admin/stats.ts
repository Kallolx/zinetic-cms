import { createAdminClient } from "@/lib/supabase/admin";
import type { Point } from "@/components/admin-panel/charts";

export type RangeDays = 7 | 30 | 90;

export const parseRange = (v?: string): RangeDays => (v === "7" ? 7 : v === "90" ? 90 : 30);

const DAY = 86_400_000;
const key = (d: Date) => d.toISOString().slice(0, 10);

/** The last `days` calendar days ending today, oldest first, as YYYY-MM-DD. */
export function dayKeys(days: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) out.push(key(new Date(today.getTime() - i * DAY)));
  return out;
}

const shortDay = (k: string) => new Date(k + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Adds up `value` per day for the window, as chart points with an empty day shown as zero. */
export function seriesByDay<T>(rows: T[], when: (r: T) => string | null, value: (r: T) => number, days: number): Point[] {
  const keys = dayKeys(days);
  const totals = new Map(keys.map((k) => [k, 0]));
  for (const r of rows) {
    const w = when(r);
    if (!w) continue;
    const k = w.slice(0, 10);
    if (totals.has(k)) totals.set(k, (totals.get(k) ?? 0) + value(r));
  }
  return keys.map((k) => ({ label: shortDay(k), value: Math.round((totals.get(k) ?? 0) * 100) / 100 }));
}

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** Change against the period before, in percent. Null when there was nothing before to compare to. */
export const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

export const fmtBdt = (n: number) => `৳${Math.round(n).toLocaleString("en-US")}`;
export const fmtNum = (n: number) => n.toLocaleString("en-US");

export type Overview = Awaited<ReturnType<typeof loadOverview>>;

/**
 * Everything the overview needs, in one parallel round of queries. Rows are read for
 * twice the window so every figure can show how it moved against the period before.
 */
export async function loadOverview(range: RangeDays) {
  const db = createAdminClient();
  const now = Date.now();
  const since = new Date(now - range * DAY).toISOString();
  const prevSince = new Date(now - 2 * range * DAY).toISOString();
  const dayAgo = new Date(now - DAY).toISOString();

  const [orders, topups, customers, pending, held, runs, checks, entitlements, blocked, recentOrders, recentSignups, recentAudit] = await Promise.all([
    db.from("checkout_orders").select("bdt_amount, usd_price, product, service, paid_at").eq("status", "paid").gte("paid_at", prevSince),
    db.from("payment_sessions").select("amount, validated_at").eq("status", "valid").gte("validated_at", prevSince),
    db.from("profiles").select("created_at, status").eq("role", "user").gte("created_at", prevSince),
    db.from("profiles").select("id, full_name, email, created_at").eq("role", "user").eq("status", "pending").order("created_at", { ascending: true }).limit(6),
    db.from("checkout_orders").select("id", { count: "exact", head: true }).eq("status", "held"),
    db.from("studio_generations").select("status, kind, created_at").gte("created_at", prevSince),
    db.from("mcn_checks").select("status, created_at").gte("created_at", prevSince),
    db.from("studio_entitlements").select("user_id, quota, used, expires_at").limit(5000),
    db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user").eq("status", "blocked"),
    db.from("checkout_orders").select("id, email, service, plan, bdt_amount, paid_at, user_id").eq("status", "paid").order("paid_at", { ascending: false }).limit(6),
    db.from("profiles").select("id, full_name, email, created_at, status").eq("role", "user").order("created_at", { ascending: false }).limit(6),
    db.from("admin_audit").select("id, action, target_label, admin_email, created_at, target_user").order("created_at", { ascending: false }).limit(6),
  ]);

  const o = orders.data ?? [];
  const t = topups.data ?? [];
  const inRange = (iso: string | null) => Boolean(iso && iso >= since);

  // revenue is what SSLCommerz actually settled, in BDT: plan purchases plus wallet top-ups
  const revRows = [
    ...o.map((r) => ({ at: r.paid_at as string | null, bdt: Number(r.bdt_amount), product: r.product as string })),
    ...t.map((r) => ({ at: r.validated_at as string | null, bdt: Number(r.amount), product: "topup" })),
  ];
  const revCur = revRows.filter((r) => inRange(r.at));
  const revPrev = revRows.filter((r) => !inRange(r.at));
  const revenue = sum(revCur.map((r) => r.bdt));
  const revenuePrev = sum(revPrev.map((r) => r.bdt));

  const byProduct: Record<string, number> = {};
  for (const r of revCur) byProduct[r.product] = (byProduct[r.product] ?? 0) + r.bdt;

  const cust = customers.data ?? [];
  const newCur = cust.filter((c) => inRange(c.created_at)).length;
  const newPrev = cust.length - newCur;

  const g = runs.data ?? [];
  const gCur = g.filter((r) => inRange(r.created_at));
  const gPrev = g.length - gCur.length;
  const failed = gCur.filter((r) => r.status === "failed").length;
  const failed24 = g.filter((r) => r.status === "failed" && (r.created_at as string) >= dayAgo).length;
  const byTool: Record<string, number> = {};
  for (const r of gCur) byTool[r.kind as string] = (byTool[r.kind as string] ?? 0) + 1;

  const c = checks.data ?? [];
  const cCur = c.filter((r) => inRange(r.created_at));

  const nowIso = new Date(now).toISOString();
  const live = (entitlements.data ?? []).filter((e) => Number(e.quota) - Number(e.used) > 0 && (!e.expires_at || (e.expires_at as string) > nowIso));
  const studioCustomers = new Set(live.map((e) => e.user_id as string)).size;

  return {
    range,
    revenue,
    revenuePrev,
    revenueSeries: seriesByDay(revCur, (r) => r.at, (r) => r.bdt, range),
    byProduct,
    ordersPaid: o.filter((r) => inRange(r.paid_at)).length + t.filter((r) => inRange(r.validated_at)).length,
    newCustomers: newCur,
    newCustomersPrev: newPrev,
    newSeries: seriesByDay(cust.filter((x) => inRange(x.created_at)), (r) => r.created_at, () => 1, range),
    pending: pending.data ?? [],
    held: held.count ?? 0,
    blocked: blocked.count ?? 0,
    studio: {
      runs: gCur.length,
      runsPrev: gPrev,
      failed,
      failed24,
      series: seriesByDay(gCur, (r) => r.created_at, () => 1, range),
      byTool: Object.entries(byTool).sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value })),
      activePlans: live.length,
      customers: studioCustomers,
    },
    checker: {
      checks: cCur.length,
      checksPrev: c.length - cCur.length,
      series: seriesByDay(cCur, (r) => r.created_at, () => 1, range),
    },
    recent: { orders: recentOrders.data ?? [], signups: recentSignups.data ?? [], audit: recentAudit.data ?? [] },
  };
}
