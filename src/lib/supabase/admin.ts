import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client, bypasses RLS. Server-only (admin approvals, wallet
 * credits/debits, MCN API proxy). Never import this into client components.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
