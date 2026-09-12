import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import type { McnCheck } from "@/lib/types";

export async function GET() {
  const { user } = await getDashboardSession();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const [{ data: profile }, { data: checks }] = await Promise.all([
    supabase.from("profiles").select("wallet_balance").eq("id", user.id).single(),
    supabase
      .from("mcn_checks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  // one row per channel, most recent check wins
  const seen = new Set<string>();
  const channels: McnCheck[] = [];
  for (const c of checks ?? []) {
    const key = c.channel_id ?? c.channel_input;
    if (seen.has(key)) continue;
    seen.add(key);
    channels.push(c);
  }

  return NextResponse.json({
    channels,
    walletBalance: Number(profile?.wallet_balance ?? 0),
  });
}
