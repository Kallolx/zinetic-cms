import { redirect } from "next/navigation";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { getMyProducts } from "@/lib/products-server";
import { NoAccess } from "@/components/no-access";
import { StudioShell } from "@/components/studio/studio-shell";
import { accessByTool, entitlementRows, summarize } from "@/lib/studio/entitlements";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isImpersonating } = await getDashboardSession();

  if (!user || !profile) redirect("/login");
  if (!isImpersonating && profile.role === "admin") redirect("/admin");
  if (profile.status !== "approved") redirect("/pending");
  const [products, rows] = await Promise.all([getMyProducts(user.id), entitlementRows(user.id)]);
  const hasAccess = products.has("studio");
  const summary = summarize(rows);
  const access = accessByTool(summary);
  const activePlans = Object.values(summary).filter((x) => x.active).length;

  return (
    <StudioShell
      userName={profile.full_name ?? ""}
      userEmail={user.email ?? ""}
      open={access}
      activePlans={activePlans}
      impersonating={isImpersonating}
    >
      {hasAccess ? children : <NoAccess product="AI Studio" />}
    </StudioShell>
  );
}
