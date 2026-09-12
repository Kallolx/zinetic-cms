import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChannelsBoard } from "@/components/dashboard/channels-board";
import type { McnCheck } from "@/lib/types";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: checks }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance").eq("id", user.id).single(),
    supabase
      .from("mcn_checks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const walletBalance = Number(profile?.wallet_balance ?? 0);

  // one row per channel, most recent check wins
  const seen = new Set<string>();
  const channels: McnCheck[] = [];
  for (const c of checks ?? []) {
    const key = c.channel_id ?? c.channel_input;
    if (seen.has(key)) continue;
    seen.add(key);
    channels.push(c);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Copyright</h2>
        <p className="text-[0.925rem] text-muted-foreground">
          Track which network each of your channels belongs to.
        </p>
      </div>

      <ChannelsBoard channels={channels} walletBalance={walletBalance} initialQuery={q ?? ""} />
    </div>
  );
}
