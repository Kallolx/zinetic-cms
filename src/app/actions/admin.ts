"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IMPERSONATE_COOKIE } from "@/lib/supabase/dashboard-session";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Not authorized.");
  return user;
}

export async function reviewUser(
  userId: string,
  decision: "approved" | "rejected"
) {
  const admin = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin.id,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { error: null };
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "You can't delete your own account." };

  const supabaseAdmin = createAdminClient();

  const { data: target } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (target?.role === "admin") return { error: "Admins can't delete other admins." };

  // deletes the auth user; profiles/wallet_transactions/mcn_checks cascade via FK
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { error: null };
}

/**
 * Impersonation never touches Supabase Auth cookies, it just drops a
 * marker cookie that getDashboardSession() checks (only trusted when the
 * real signed-in session is an admin, re-verified server-side on every
 * request). The admin's real session stays fully logged in the whole
 * time, in this tab and every other one, including /admin itself.
 */
export async function impersonateUser(userId: string) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { data: target, error: targetError } = await supabaseAdmin
    .from("profiles")
    .select("role, status")
    .eq("id", userId)
    .single();

  if (targetError || !target) return { error: "User not found." };
  if (target.role === "admin") return { error: "Can't impersonate another admin." };
  if (target.status !== "approved") return { error: "Only approved users can be impersonated." };

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATE_COOKIE, userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
  });

  return { error: null };
}

export async function stopImpersonating() {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function topUpWallet(userId: string, amount: number, note?: string) {
  const admin = await requireAdmin();
  if (!amount || amount <= 0) return { error: "Enter a valid amount." };

  const supabaseAdmin = createAdminClient();

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("wallet_balance")
    .eq("id", userId)
    .single();

  if (profileError || !profile) return { error: "User not found." };

  const newBalance = Number(profile.wallet_balance) + amount;

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ wallet_balance: newBalance })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  await supabaseAdmin.from("wallet_transactions").insert({
    user_id: userId,
    type: "topup",
    amount,
    note: note || "Manual top-up by admin",
    created_by: admin.id,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { error: null };
}
