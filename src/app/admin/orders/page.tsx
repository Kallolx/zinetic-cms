import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { fmtBdt, parseRange, pct, seriesByDay, sum } from "@/lib/admin/stats";
import { serviceName } from "@/lib/studio/services";
import { BarChart } from "@/components/admin-panel/charts";
import { StatCard } from "@/components/admin-panel/stat-card";
import { OrdersTable, type OrderRow } from "@/components/admin-panel/orders-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LuReceipt } from "react-icons/lu";
import { cn } from "@/lib/utils";

type Rel = { full_name: string | null; email: string } | null;

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ range?: string; status?: string }> }) {
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const db = createAdminClient();
  const [orders, topups] = await Promise.all([
    db.from("checkout_orders").select("id, tran_id, user_id, email, service, plan, bdt_amount, status, created_at, paid_at, profiles:user_id(full_name)").order("created_at", { ascending: false }).limit(1500),
    db.from("payment_sessions").select("id, tran_id, user_id, amount, status, created_at, validated_at, profiles:user_id(full_name, email)").order("created_at", { ascending: false }).limit(1500),
  ]);

  const rows: OrderRow[] = [
    ...(orders.data ?? []).map((o) => ({
      id: o.id as string,
      at: o.created_at as string,
      userId: o.user_id as string | null,
      customer: ((o.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "") as string,
      email: o.email as string,
      kind: "plan" as const,
      what: `${serviceName(o.service as string)} · ${o.plan}`,
      bdt: Number(o.bdt_amount),
      status: (o.status === "paid" ? "paid" : o.status === "held" ? "held" : o.status === "pending" ? "unpaid" : "failed") as OrderRow["status"],
      ref: o.tran_id as string,
    })),
    ...(topups.data ?? []).map((t) => {
      const p = t.profiles as unknown as Rel;
      return {
        id: t.id as string,
        at: t.created_at as string,
        userId: t.user_id as string | null,
        customer: p?.full_name ?? "",
        email: p?.email ?? "",
        kind: "topup" as const,
        what: "Checker credit top-up",
        bdt: Number(t.amount),
        status: (t.status === "valid" ? "paid" : t.status === "pending" ? "unpaid" : "failed") as OrderRow["status"],
        ref: t.tran_id as string,
      };
    }),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  const day = 86_400_000;
  // eslint-disable-next-line react-hooks/purity -- server component, evaluated fresh per request
  const now = Date.now();
  const since = new Date(now - range * day).toISOString();
  const prevSince = new Date(now - 2 * range * day).toISOString();
  const paid = rows.filter((r) => r.status === "paid");
  const cur = paid.filter((r) => r.at >= since);
  const prev = paid.filter((r) => r.at >= prevSince && r.at < since);
  const revenue = sum(cur.map((r) => r.bdt));
  const finished = rows.filter((r) => r.at >= since && r.status !== "unpaid");
  const successRate = finished.length ? Math.round((finished.filter((r) => r.status === "paid" || r.status === "held").length / finished.length) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Orders and revenue</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every payment, from plan purchases to Checker top-ups, as settled through SSLCommerz in BDT.</p>
        </div>
        <div className="flex rounded-lg border bg-muted/40 p-1 text-sm">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/admin/orders?range=${d}`} className={cn("rounded-md px-3 py-1.5 transition-colors", d === range ? "bg-background font-medium shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {d} days
            </Link>
          ))}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={fmtBdt(revenue)} delta={pct(revenue, sum(prev.map((r) => r.bdt)))} sub={`last ${range} days`} icon={<LuReceipt />} />
        <StatCard label="Paid payments" value={cur.length} delta={pct(cur.length, prev.length)} />
        <StatCard label="Average payment" value={fmtBdt(cur.length ? revenue / cur.length : 0)} />
        <StatCard label="Held for review" value={rows.filter((r) => r.status === "held").length} sub={successRate === null ? "" : `${successRate}% of attempts succeed`} tone={rows.some((r) => r.status === "held") ? "attention" : "default"} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily revenue</CardTitle>
          <CardDescription>BDT paid each day of the last {range} days.</CardDescription>
        </CardHeader>
        <CardContent>
          <BarChart data={seriesByDay(cur, (r) => r.at, (r) => r.bdt, range)} format={fmtBdt} height={200} />
        </CardContent>
      </Card>

      <Suspense>
        <OrdersTable rows={rows} initialStatus={sp.status} />
      </Suspense>
    </div>
  );
}
