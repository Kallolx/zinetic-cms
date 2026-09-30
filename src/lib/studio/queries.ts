import { createClient } from "@/lib/supabase/server";
import type { HistoryRow } from "@/components/studio/ui";

/** Latest generations of the given kinds for the signed-in (or impersonated) user. */
export async function recentGenerations(userId: string, kinds: string[], limit = 6): Promise<HistoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_generations")
    .select("id, title, status, mime_type, error, created_at")
    .eq("user_id", userId)
    .in("kind", kinds)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as HistoryRow[];
}
