import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/supabase/session";
import { AppShell, type NavItem } from "@/components/app-shell";
import {
  LuShieldCheck,
  LuShieldOff,
  LuReceipt,
  LuUserRound,
  LuLifeBuoy,
  LuSparkles,
  LuTriangleAlert,
  LuVideo,
} from "react-icons/lu";

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Copyright", icon: <LuShieldCheck /> },
  { href: "/dashboard/release-claim", label: "Release Claim", icon: <LuShieldOff /> },
  { href: "/dashboard/issues", label: "Issues", icon: <LuTriangleAlert /> },
  { href: "/dashboard/claimed-videos", label: "Claimed videos", icon: <LuVideo /> },
  { href: "/dashboard/wallet", label: "Transactions", icon: <LuReceipt /> },
  { href: "/dashboard/accounts", label: "Accounts", icon: <LuUserRound /> },
];

const secondaryNavItems: NavItem[] = [
  { href: "/dashboard/support", label: "Support", icon: <LuLifeBuoy /> },
  { href: "/dashboard/updates", label: "Updates", icon: <LuSparkles /> },
];

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();

  if (!user) redirect("/login");
  if (!profile) redirect("/login");
  if (profile.role === "admin") redirect("/admin");
  if (profile.status !== "approved") redirect("/pending");

  return (
    <AppShell
      navItems={navItems}
      secondaryNavItems={secondaryNavItems}
      userName={profile.full_name ?? ""}
      userEmail={user.email ?? ""}
      walletBalance={Number(profile.wallet_balance)}
      roleLabel="Member"
      title="Dashboard"
    >
      {children}
    </AppShell>
  );
}
