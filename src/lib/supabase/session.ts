import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/**
 * Fetches the current user + full profile row once per request. React's
 * cache() dedupes this across every layout/page that calls it during the
 * same render pass, so a single navigation does one auth + one profile
 * query instead of one per segment.
 */
export const getSessionProfile = cache(async () => {
  const supabase = await createClient();
  // getClaims checks the signed token locally (no round trip to Supabase Auth),
  // the middleware has already refreshed it if it was about to expire
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return { user: null, profile: null };
  const user = { id: claims.sub, email: (claims.email as string | undefined) ?? "" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: (profile as Profile) ?? null };
});
