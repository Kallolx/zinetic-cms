import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProductId } from "@/lib/products";

/** Products a user may open. Resolved through RLS, so it is always the caller's own rows. */
export const getMyProducts = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("user_products").select("product").eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.product as ProductId));
});
