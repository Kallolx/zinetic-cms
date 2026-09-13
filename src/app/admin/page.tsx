import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LuUsers, LuClock, LuHistory, LuTrendingUp, LuArrowRight } from "react-icons/lu";
import { UsersTable } from "@/components/admin/users-table";

function StatusDot({ status }: { status: string }) {
  const color =
    status === "success"
      ? "bg-emerald-500"
      : status === "not_found"
        ? "bg-muted-foreground"
        : "bg-destructive";
  return <span className={`size-1.5 rounded-full ${color}`} />;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  // eslint-disable-next-line react-hooks/purity -- server component, evaluated fresh per request
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: totalChecks },
    { count: checksThisWeek },
    { data: pending },
    { data: costRows },
    { data: recentChecks },
    { data: recentTopups },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("mcn_checks").select("id", { count: "exact", head: true }),
    supabase
      .from("mcn_checks")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo),
    supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(5),
    supabase.from("mcn_checks").select("cost").neq("status", "error"),
    supabase
      .from("mcn_checks")
      .select("id, channel_name, channel_input, avatar_url, network, status, created_at, profiles:user_id(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("wallet_transactions")
      .select("id, amount, note, created_at, profiles:user_id(full_name, email)")
      .eq("type", "topup")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalRevenue = (costRows ?? []).reduce((sum, r) => sum + Number(r.cost), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={LuUsers} label="Total users" value={String(totalUsers ?? 0)} />
        <SummaryCard icon={LuClock} label="Pending approval" value={String(pendingUsers ?? 0)} />
        <SummaryCard
          icon={LuHistory}
          label="Checks run"
          value={String(totalChecks ?? 0)}
          hint={`+${checksThisWeek ?? 0} this week`}
        />
        <SummaryCard
          icon={LuTrendingUp}
          label="Revenue collected"
          value={`$${totalRevenue.toFixed(2)}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent checks</CardTitle>
            <Link
              href="/admin/checks"
              className="flex items-center gap-1 text-sm text-primary underline underline-offset-4"
            >
              View all <LuArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {!recentChecks || recentChecks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No checks yet.</p>
            ) : (
              <div className="flex flex-col divide-y">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(recentChecks as any[]).map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/checks/${c.id}`}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:bg-accent/50 rounded-md px-2 -mx-2 transition-colors"
                  >
                    {c.avatar_url ? (
                      <Image
                        src={c.avatar_url}
                        alt=""
                        width={32}
                        height={32}
                        unoptimized
                        className="size-8 shrink-0 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {initials(c.channel_name ?? c.channel_input)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {c.channel_name ?? c.channel_input}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.profiles?.full_name ?? c.profiles?.email} &middot;{" "}
                        {c.network ?? "N/A"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                      <StatusDot status={c.status} />
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent top-ups</CardTitle>
            <Link
              href="/admin/topup"
              className="flex items-center gap-1 text-sm text-primary underline underline-offset-4"
            >
              View all <LuArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {!recentTopups || recentTopups.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No top-ups yet.</p>
            ) : (
              <div className="flex flex-col divide-y">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(recentTopups as any[]).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {t.profiles?.full_name ?? t.profiles?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.note?.startsWith("SSLCommerz top-up") ? "via SSLCommerz" : "by admin"}
                        {" · "}
                        {new Date(t.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
                      +${Number(t.amount).toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardDescription className="flex items-center gap-1.5">
              <LuClock className="size-4" /> Awaiting your review
            </CardDescription>
          </div>
          <Link
            href="/admin/approvals"
            className="text-sm text-primary underline underline-offset-4"
          >
            Go to Approvals →
          </Link>
        </CardHeader>
        <CardContent>
          {!pending || pending.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No pending registrations. All caught up.
            </p>
          ) : (
            <UsersTable users={pending} compact />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-bold">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
