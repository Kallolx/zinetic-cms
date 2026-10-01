import { redirect } from "next/navigation";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { getMyProducts } from "@/lib/products-server";
import { NoAccess } from "@/components/no-access";
import { StudioShell } from "@/components/studio/studio-shell";

export const dynamic = "force-dynamic";

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isImpersonating } = await getDashboardSession();

  if (!user || !profile) redirect("/login");
  if (!isImpersonating && profile.role === "admin") redirect("/admin");
  if (profile.status !== "approved") redirect("/pending");
  const hasAccess = (await getMyProducts(user.id)).has("studio");

  return (
    <StudioShell
      userName={profile.full_name ?? ""}
      userEmail={user.email ?? ""}
      balance={Number(profile.studio_balance ?? 0)}
      impersonating={isImpersonating}
    >
      {hasAccess ? children : <NoAccess product="AI Studio" />}
    </StudioShell>
  );
}
