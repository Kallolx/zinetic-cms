import { cookies } from "next/headers";
import { cache } from "react";
import { getSessionProfile } from "@/lib/supabase/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export const IMPERSONATE_COOKIE = "zc_impersonate_user";

/**
 * Resolves the user whose dashboard is actually being viewed in this
 * request. Normally that's just the real logged-in user. But when the
 * real user is an admin who has started impersonating someone (via the
 * zc_impersonate_user cookie, set only by the admin-only impersonate
 * action), this returns the impersonated user instead, without ever
 * touching Supabase Auth cookies, this admin's real session stays fully
 * intact in every other tab, including /admin in this same tab.
 */
export const getDashboardSession = cache(async () => {
  const { user: realUser, profile: realProfile } = await getSessionProfile();

  if (!realUser || !realProfile) {
    return {
      user: null as { id: string; email: string } | null,
      profile: null as Profile | null,
      isImpersonating: false,
      realProfile: null as Profile | null,
    };
  }

  if (realProfile.role === "admin") {
    const cookieStore = await cookies();
    const impersonatedId = cookieStore.get(IMPERSONATE_COOKIE)?.value;
    if (impersonatedId) {
      const admin = createAdminClient();
      const { data: target } = await admin
        .from("profiles")
        .select("*")
        .eq("id", impersonatedId)
        .single();
      if (target) {
        return {
          user: { id: target.id, email: target.email },
          profile: target as Profile,
          isImpersonating: true,
          realProfile,
        };
      }
    }
  }

  return {
    user: { id: realUser.id, email: realUser.email ?? "" },
    profile: realProfile,
    isImpersonating: false,
    realProfile,
  };
});
