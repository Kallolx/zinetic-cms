import { createClient } from "@/lib/supabase/server";

/** The signed-in admin, or an error. Every admin action and route starts here. */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");
  const { data: profile } = await supabase.from("profiles").select("role, email").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized.");
  return { id: user.id, email: profile.email as string };
}
