import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { LuUsers, LuClock, LuHistory, LuCircleCheck } from "react-icons/lu";
import { UsersTable } from "@/components/admin/users-table";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: pendingUsers },
    { count: totalChecks },
    { data: pending },
    { data: approved },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "user"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("mcn_checks").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10),
    supabase
      .from("profiles")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={LuUsers} label="Total users" value={String(totalUsers ?? 0)} />
        <SummaryCard icon={LuClock} label="Pending approval" value={String(pendingUsers ?? 0)} />
        <SummaryCard icon={LuHistory} label="Total checks run" value={String(totalChecks ?? 0)} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardDescription className="flex items-center gap-1.5">
              <LuClock className="size-4" /> Awaiting your review
            </CardDescription>
          </div>
          <Link href="/admin/users" className="text-sm text-primary underline underline-offset-4">
            View all users →
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardDescription className="flex items-center gap-1.5">
              <LuCircleCheck className="size-4" /> Approved users
            </CardDescription>
          </div>
          <Link href="/admin/users" className="text-sm text-primary underline underline-offset-4">
            View all users →
          </Link>
        </CardHeader>
        <CardContent>
          {!approved || approved.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No approved users yet.
            </p>
          ) : (
            <UsersTable users={approved} />
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
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="font-heading text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
