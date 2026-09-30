import { redirect } from "next/navigation";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { getMyProducts } from "@/lib/products-server";
import { NoAccess } from "@/components/no-access";
import { AppShell, type NavItem } from "@/components/app-shell";
import { GROUPS, TOOLS } from "@/lib/studio/tools";
import { LuAudioLines, LuClapperboard, LuFolderOpen, LuLayoutGrid, LuLifeBuoy } from "react-icons/lu";

const groupIcon = { audio: <LuAudioLines />, video: <LuClapperboard /> };

const navItems: NavItem[] = [
  { href: "/studio", label: "Overview", icon: <LuLayoutGrid /> },
  ...GROUPS.map((g) => ({
    href: "#",
    label: g.label,
    icon: groupIcon[g.id],
    children: TOOLS.filter((t) => t.group === g.id && t.href).map((t) => ({ href: t.href!, label: t.name, icon: null })),
  })),
  { href: "/studio/library", label: "Library", icon: <LuFolderOpen /> },
];

const secondaryNavItems: NavItem[] = [{ href: "/dashboard/support", label: "Support", icon: <LuLifeBuoy /> }];

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isImpersonating } = await getDashboardSession();

  if (!user || !profile) redirect("/login");
  if (!isImpersonating && profile.role === "admin") redirect("/admin");
  if (profile.status !== "approved") redirect("/pending");
  const hasAccess = (await getMyProducts(user.id)).has("studio");

  return (
    <AppShell
      navItems={navItems}
      secondaryNavItems={secondaryNavItems}
      userName={profile.full_name ?? ""}
      userEmail={user.email ?? ""}
      walletBalance={Number(profile.wallet_balance)}
      roleLabel="Member"
      title="AI Studio"
      impersonating={isImpersonating}
    >
      {hasAccess ? children : <NoAccess product="AI Studio" />}
    </AppShell>
  );
}
