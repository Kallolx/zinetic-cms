import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/supabase/session";
import { getProduct, productUrl } from "@/lib/products";
import { AdminShell } from "@/components/admin-panel/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();

  if (!user) redirect("/login");
  if (!profile || profile.role !== "admin") redirect("/dashboard");

  // how many sign-ups are waiting, for the badge in the sidebar and the bell
  const { count } = await createAdminClient().from("profiles").select("id", { count: "exact", head: true }).eq("role", "user").eq("status", "pending");

  return (
    <AdminShell
      adminName={profile.full_name ?? ""}
      adminEmail={user.email ?? ""}
      pending={count ?? 0}
      links={{ cms: productUrl(getProduct("cms")), studio: productUrl(getProduct("studio")) }}
    >
      {children}
    </AdminShell>
  );
}
