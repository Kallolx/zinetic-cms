import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { fmtNum, seriesByDay } from "@/lib/admin/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChecksTable } from "@/components/admin/checks-table";
import { StatCard } from "@/components/admin-panel/stat-card";

export default async function AdminChecksPage() {
  const supabase = await createClient();
  // eslint-disable-next-line react-hooks/purity -- server component, evaluated fresh per request
  const now = Date.now();
  const since = new Date(now - 30 * 86_400_000).toISOString();
  const dayAgoIso = new Date(now - 86_400_000).toISOString();
  const [{ data: checks }, { data: recent }] = await Promise.all([
    supabase.from("mcn_checks").select("*, profiles:user_id(full_name, email)").order("created_at", { ascending: false }).limit(200),
    createAdminClient().from("mcn_checks").select("status, created_at, user_id").gte("created_at", since),
  ]);
  const r = recent ?? [];
  const dayAgo = r.filter((x) => (x.created_at as string) >= dayAgoIso).length;
  const ok = r.filter((x) => x.status === "success").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Channel checks</h1>
        <p className="mt-1 text-sm text-muted-foreground">Every channel check customers have run in the Channel Checker.</p>
      </div>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Checks, last 30 days" value={fmtNum(r.length)} spark={seriesByDay(r, (x) => x.created_at as string, () => 1, 30).map((p) => p.value)} />
        <StatCard label="Last 24 hours" value={fmtNum(dayAgo)} />
        <StatCard label="Found a network" value={r.length ? `${Math.round((ok / r.length) * 100)}%` : "-"} sub={`${fmtNum(ok)} of ${fmtNum(r.length)}`} />
        <StatCard label="Customers checking" value={fmtNum(new Set(r.map((x) => x.user_id)).size)} sub="last 30 days" />
      </section>
      <Card>
        <CardHeader>
          <CardTitle>All checks</CardTitle>
          <CardDescription>Latest 200 across all customers.</CardDescription>
        </CardHeader>
        <CardContent>
          {!checks || checks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No checks yet.</p>
          ) : (
            <ChecksTable checks={checks} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
