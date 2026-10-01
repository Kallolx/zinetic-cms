import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { entitlementRows, summarize, type EntitlementRow } from "@/lib/studio/entitlements";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  status: Profile["status"];
  joined: string;
  products: string[];
  /** Channel Checker wallet, in USD */
  walletUsd: number;
  studioActive: number;
  /** BDT paid in total */
  spent: number;
};

/** Everyone, with what each person has open and has paid. One round of queries, filtered in the browser. */
export async function loadCustomerList(): Promise<CustomerRow[]> {
  const db = createAdminClient();
  const nowIso = new Date().toISOString();
  const [profiles, products, ents, orders, topups] = await Promise.all([
    db.from("profiles").select("id, full_name, email, status, created_at, wallet_balance").eq("role", "user").order("created_at", { ascending: false }).limit(2000),
    db.from("user_products").select("user_id, product"),
    db.from("studio_entitlements").select("user_id, service, quota, used, expires_at").limit(10000),
    db.from("checkout_orders").select("user_id, bdt_amount").eq("status", "paid"),
    db.from("payment_sessions").select("user_id, amount").eq("status", "valid"),
  ]);

  const prod = new Map<string, string[]>();
  for (const p of products.data ?? []) prod.set(p.user_id, [...(prod.get(p.user_id) ?? []), p.product]);

  const active = new Map<string, Set<string>>();
  for (const e of ents.data ?? []) {
    if (Number(e.quota) - Number(e.used) > 0 && (!e.expires_at || (e.expires_at as string) > nowIso)) {
      if (!active.has(e.user_id)) active.set(e.user_id, new Set());
      active.get(e.user_id)!.add(e.service);
    }
  }

  const spent = new Map<string, number>();
  for (const o of orders.data ?? []) if (o.user_id) spent.set(o.user_id, (spent.get(o.user_id) ?? 0) + Number(o.bdt_amount));
  for (const t of topups.data ?? []) if (t.user_id) spent.set(t.user_id, (spent.get(t.user_id) ?? 0) + Number(t.amount));

  return (profiles.data ?? []).map((p) => ({
    id: p.id,
    name: p.full_name ?? "",
    email: p.email,
    status: p.status,
    joined: p.created_at,
    products: prod.get(p.id) ?? [],
    walletUsd: Number(p.wallet_balance),
    studioActive: active.get(p.id)?.size ?? 0,
    spent: spent.get(p.id) ?? 0,
  }));
}

export type CustomerDetail = NonNullable<Awaited<ReturnType<typeof loadCustomer>>>;

/** One customer with everything an admin needs to look after them. */
export async function loadCustomer(id: string) {
  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile || profile.role === "admin") return null;

  const [products, ents, txs, orders, topups, runs, runCount, checkCount, audit] = await Promise.all([
    db.from("user_products").select("product").eq("user_id", id),
    entitlementRows(id),
    db.from("wallet_transactions").select("id, type, amount, note, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(40),
    db.from("checkout_orders").select("id, tran_id, service, plan, product, bdt_amount, usd_price, status, created_at, paid_at").eq("user_id", id).order("created_at", { ascending: false }).limit(40),
    db.from("payment_sessions").select("id, tran_id, amount, usd_amount, status, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(40),
    db.from("studio_generations").select("id, kind, title, status, service, units, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(25),
    db.from("studio_generations").select("id", { count: "exact", head: true }).eq("user_id", id),
    db.from("mcn_checks").select("id", { count: "exact", head: true }).eq("user_id", id),
    db.from("admin_audit").select("id, action, admin_email, detail, created_at").eq("target_user", id).order("created_at", { ascending: false }).limit(30),
  ]);

  const paidOrders = (orders.data ?? []).filter((o) => o.status === "paid");
  const paidTopups = (topups.data ?? []).filter((t) => t.status === "valid");
  const spent = paidOrders.reduce((n, o) => n + Number(o.bdt_amount), 0) + paidTopups.reduce((n, t) => n + Number(t.amount), 0);

  return {
    profile: profile as Profile,
    products: (products.data ?? []).map((p) => p.product as string),
    entitlements: ents as EntitlementRow[],
    summary: summarize(ents),
    transactions: txs.data ?? [],
    orders: orders.data ?? [],
    topups: topups.data ?? [],
    runs: runs.data ?? [],
    runCount: runCount.count ?? 0,
    checkCount: checkCount.count ?? 0,
    audit: audit.data ?? [],
    spent,
  };
}
