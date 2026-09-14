import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchProviderChannel, mapProviderResult } from "@/lib/mcn-provider";

// keep each run well under Vercel's function time limit
const BATCH_SIZE = 25;

/**
 * Server-side background refresh: re-polls every channel the provider is
 * still processing (provider_status = "pending") and writes real data the
 * moment it's available. This is the only thing that ever moves a channel
 * out of "pending", independent of whether anyone has the page open.
 *
 * Triggered every 5 minutes by Supabase's pg_cron (see
 * supabase/add_pg_cron_refresh.sql), with Vercel's own daily cron
 * (vercel.json) as a fallback in case pg_cron is ever disabled.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const admin = createAdminClient();

  const { data: pending, error } = await admin
    .from("mcn_checks")
    .select("id, channel_id")
    .eq("provider_status", "pending")
    .not("channel_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!pending || pending.length === 0) {
    return NextResponse.json({ checked: 0, updated: 0 });
  }

  let updated = 0;

  for (const row of pending) {
    if (!row.channel_id) continue;
    const fetched = await fetchProviderChannel(row.channel_id);
    if (fetched.outcome !== "ok") continue;

    const update = mapProviderResult(fetched.result);
    const { error: updateError } = await admin
      .from("mcn_checks")
      .update(update)
      .eq("id", row.id);

    if (!updateError) updated += 1;
  }

  return NextResponse.json({ checked: pending.length, updated });
}
