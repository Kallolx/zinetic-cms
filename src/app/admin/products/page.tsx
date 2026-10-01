import Link from "next/link";
import { LuArrowUpRight, LuClock } from "react-icons/lu";
import { createClient } from "@/lib/supabase/server";
import { PRODUCTS, productUrl, type ProductId } from "@/lib/products";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EntitlementRow } from "@/lib/studio/entitlements";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const [{ data: users }, { data: grants }, { data: ents }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, status")
      .eq("role", "user")
      .order("created_at", { ascending: false }),
    supabase.from("user_products").select("user_id, product"),
    supabase.from("studio_entitlements").select("*").order("created_at", { ascending: false }),
  ]);

  const access: Record<string, ProductId[]> = {};
  const counts: Record<string, number> = {};
  for (const g of grants ?? []) {
    (access[g.user_id] ??= []).push(g.product as ProductId);
    counts[g.product] = (counts[g.product] ?? 0) + 1;
  }

  const entitlements: Record<string, EntitlementRow[]> = {};
  for (const e of ents ?? []) (entitlements[e.user_id] ??= []).push({ ...e, quota: Number(e.quota), used: Number(e.used) });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {PRODUCTS.map((p) => {
          const url = productUrl(p);
          return (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  {p.live ? (
                    <span className="text-xs font-medium text-emerald-500">Live</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <LuClock className="size-3.5" /> Building
                    </span>
                  )}
                </div>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <div>
                  <p className="font-heading text-3xl font-semibold">{counts[p.id] ?? 0}</p>
                  <p className="text-xs text-muted-foreground">customers with access</p>
                </div>
                {url && (
                  <Link
                    href={url}
                    target="_blank"
                    className="flex items-center gap-1 text-sm underline underline-offset-4"
                  >
                    Open <LuArrowUpRight className="size-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access</CardTitle>
          <CardDescription>
            Choose which dashboards each customer can open. To see a dashboard exactly as a customer
            does, use Impersonate from Users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductsTable users={users ?? []} access={access} entitlements={entitlements} />
        </CardContent>
      </Card>
    </div>
  );
}
