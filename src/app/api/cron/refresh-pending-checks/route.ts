import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchProviderChannel, mapProviderResult } from "@/lib/mcn-provider";

// keep each run well under Vercel's function time limit
const BATCH_SIZE = 25;

/**
 * Server-side background refresh: re-polls every channel that isn't fully
 * settled yet and writes real data the moment it's available. This is the
 * only thing that ever moves a channel forward, independent of whether
 * anyone has the page open.
 *
 * "Not settled" covers two cases: provider_status != "updated" (still
 * being crawled, e.g. "sent", "pending", or any other in-progress value
 * they use), and the trickier one, provider_status = "updated" but with a
 * network match and no contact email yet, since the provider finalizes
 * the network before the email lookup necessarily completes. Both network
 * and email are required before a channel counts as settled, so the
 * second case keeps getting re-polled indefinitely, however long it
 * takes, rather than ever being shown as a blank/N/A email.
 *
 * Rows with a null provider_status are legacy/untracked and intentionally
 * excluded, only channels the provider has told us it's still working on
 * get re-polled.
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
    .not("provider_status", "is", null)
    .not("channel_id", "is", null)
    .or("provider_status.neq.updated,and(network.not.is.null,network_contact_email.is.null)")
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
