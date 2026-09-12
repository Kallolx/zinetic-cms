import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell, type NavItem } from "@/components/app-shell";
import { LuGauge, LuUsers, LuHistory } from "react-icons/lu";

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LuGauge /> },
  { href: "/admin/users", label: "Users & Approvals", icon: <LuUsers /> },
  { href: "/admin/checks", label: "All Checks", icon: <LuHistory /> },
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/dashboard");

  return (
    <AppShell
      navItems={navItems}
      userName={profile.full_name ?? ""}
      userEmail={user.email ?? ""}
      roleLabel="Administrator"
      title="Admin"
    >
      {children}
    </AppShell>
  );
}
