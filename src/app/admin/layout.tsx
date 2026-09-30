import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/session";
import { AppShell, type NavItem } from "@/components/app-shell";
import {
  LuGauge,
  LuUsers,
  LuShieldCheck,
  LuAudioLines,
  LuDisc3,
} from "react-icons/lu";

const navItems: NavItem[] = [
  { href: "/admin", label: "Overview", icon: <LuGauge /> },
  {
    href: "/admin/users",
    label: "Customers",
    icon: <LuUsers />,
    children: [
      { href: "/admin/users", label: "All users", icon: null },
      { href: "/admin/approvals", label: "Approvals", icon: null },
      { href: "/admin/products", label: "Dashboard access", icon: null },
      { href: "/admin/topup", label: "Wallets and top up", icon: null },
    ],
  },
  {
    href: "/admin/checks",
    label: "Channel Checker",
    icon: <LuShieldCheck />,
    children: [{ href: "/admin/checks", label: "All checks", icon: null }],
  },
  {
    href: "/admin/studio",
    label: "AI Studio",
    icon: <LuAudioLines />,
    children: [{ href: "/admin/studio", label: "Usage", icon: null }],
  },
  { href: "#", label: "Music Distribution", icon: <LuDisc3 />, soon: true },
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
