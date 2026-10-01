import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

export const runtime = "nodejs";

// Customers matching what an admin typed in the command menu.
export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().replace(/[%,()]/g, "");
  if (q.length < 2) return NextResponse.json({ customers: [] });

  const { data } = await createAdminClient()
    .from("profiles")
    .select("id, full_name, email, status")
    .eq("role", "user")
    .or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
    .order("created_at", { ascending: false })
    .limit(8);
  return NextResponse.json({ customers: data ?? [] });
}
