import { redirect } from "next/navigation";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
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
  const { user, profile, isImpersonating } = await getDashboardSession();

  if (!user) redirect("/login");
  if (!profile) redirect("/login");
  // an impersonating admin is allowed straight through, everyone else
  // with an admin role belongs in /admin instead
  if (!isImpersonating && profile.role === "admin") redirect("/admin");
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
      impersonating={isImpersonating}
    >
      {children}
    </AppShell>
  );
}
