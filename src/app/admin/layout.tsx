import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/session";
import { AppShell, type NavItem } from "@/components/app-shell";
import { LuGauge, LuUsers, LuHistory } from "react-icons/lu";

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LuGauge /> },
  { href: "/admin/users", label: "Users & Approvals", icon: <LuUsers /> },
  { href: "/admin/checks", label: "All Checks", icon: <LuHistory /> },
];

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();

  if (!user) redirect("/login");
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
