import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type ProductId = "cms" | "studio" | "distribution";

export type Product = {
  id: ProductId;
  name: string;
  description: string;
  live: boolean;
  /** env var holding this dashboard's public URL */
  urlEnv: "NEXT_PUBLIC_APP_URL" | "NEXT_PUBLIC_STUDIO_URL" | null;
  homePath: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "cms",
    name: "Channel Checker",
    description: "YouTube MCN checker and copyright management.",
    live: true,
    urlEnv: "NEXT_PUBLIC_APP_URL",
    homePath: "/dashboard",
  },
  {
    id: "studio",
    name: "AI Studio",
    description: "Voice, audio and video tools.",
    live: true,
    urlEnv: "NEXT_PUBLIC_STUDIO_URL",
    homePath: "/studio",
  },
  {
    id: "distribution",
    name: "Music Distribution",
    description: "Releases, royalties and analytics.",
    live: false,
    urlEnv: null,
    homePath: "/",
  },
];

export const getProduct = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;

export function productUrl(p: Product) {
  const base = p.urlEnv ? process.env[p.urlEnv] : undefined;
  return base ? base.replace(/\/$/, "") + p.homePath : null;
}

/** Products a user may open. Resolved through RLS, so it is always the caller's own rows. */
export const getMyProducts = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from("user_products").select("product").eq("user_id", userId);
  return new Set((data ?? []).map((r) => r.product as ProductId));
});
