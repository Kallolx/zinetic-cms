"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { IMPERSONATE_COOKIE } from "@/lib/supabase/dashboard-session";
import { COST_UNITS, providerSupports } from "@/lib/studio/engine-catalog";

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

  if (decision === "approved") {
    await supabaseAdmin
      .from("user_products")
      .upsert({ user_id: userId, product: "cms", granted_by: admin.id }, { onConflict: "user_id,product", ignoreDuplicates: true });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { error: null };
}

export async function blockUser(userId: string, reason?: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) return { error: "You can't block your own account." };

  const supabaseAdmin = createAdminClient();

  const { data: target } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (target?.role === "admin") return { error: "Admins can't block other admins." };

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      status: "blocked",
      blocked_at: new Date().toISOString(),
      blocked_reason: reason?.trim() || null,
      blocked_by: admin.id,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  // bans at the Supabase Auth layer itself, refuses any future sign-in
  // or refresh-token renewal, not just our own app-level check
  await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "876000h" });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  return { error: null };
}

export async function unblockUser(userId: string) {
  await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({
      status: "approved",
      blocked_at: null,
      blocked_reason: null,
      blocked_by: null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: "none" });

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

export async function setUserProduct(userId: string, product: string, enabled: boolean) {
  const admin = await requireAdmin();
  if (!["cms", "studio", "distribution"].includes(product)) return { error: "Unknown product." };
  const supabaseAdmin = createAdminClient();

  const { error } = enabled
    ? await supabaseAdmin
        .from("user_products")
        .upsert({ user_id: userId, product, granted_by: admin.id }, { onConflict: "user_id,product" })
    : await supabaseAdmin.from("user_products").delete().eq("user_id", userId).eq("product", product);

  if (error) return { error: error.message };
  revalidatePath("/admin/products");
  return { error: null };
}

export type EngineInput = {
  id?: string;
  service: string;
  key: string;
  label: string;
  description: string;
  provider: string;
  model: string;
  credit_cost: number;
  cost_unit: string;
  enabled: boolean;
  features: string[];
  max_duration_seconds: number | null;
  max_file_mb: number | null;
  max_chars: number | null;
  options: Record<string, unknown>;
  sort: number;
};

/** Creates or updates one AI Studio engine. Everything about it is data, not code. */
export async function saveEngine(input: EngineInput) {
  await requireAdmin();
  const key = input.key.trim().toLowerCase();
  if (!input.service || !/^[a-z0-9-]{1,24}$/.test(key)) return { error: "Engine key must be short letters or numbers, like v1 or v2." };
  if (!input.label.trim()) return { error: "Give the engine a name customers will see." };
  if (!providerSupports(input.provider, input.service)) return { error: "That provider has no adapter for this service yet." };
  if (!(input.credit_cost >= 0)) return { error: "Credit cost must be zero or more." };
  if (!COST_UNITS.some((u) => u.value === input.cost_unit)) return { error: "Choose how the cost is counted." };

  const row = {
    service: input.service,
    key,
    label: input.label.trim(),
    description: input.description.trim() || null,
    provider: input.provider,
    model: input.model.trim() || null,
    credit_cost: input.credit_cost,
    cost_unit: input.cost_unit,
    enabled: input.enabled,
    features: input.features.map((f) => f.trim()).filter(Boolean),
    max_duration_seconds: input.max_duration_seconds || null,
    max_file_mb: input.max_file_mb || null,
    max_chars: input.max_chars || null,
    options: input.options ?? {},
    sort: input.sort || 0,
    updated_at: new Date().toISOString(),
  };

  const db = createAdminClient();
  const { error } = input.id
    ? await db.from("studio_engines").update(row).eq("id", input.id)
    : await db.from("studio_engines").insert(row);
  if (error) return { error: error.code === "23505" ? "This service already has an engine with that key." : error.message };

  revalidatePath("/admin/engines");
  revalidatePath("/studio", "layout");
  return { error: null };
}

export async function setEngineEnabled(id: string, enabled: boolean) {
  await requireAdmin();
  const { error } = await createAdminClient().from("studio_engines").update({ enabled, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/engines");
  revalidatePath("/studio", "layout");
  return { error: null };
}

export async function deleteEngine(id: string) {
  await requireAdmin();
  const { error } = await createAdminClient().from("studio_engines").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/engines");
  revalidatePath("/studio", "layout");
  return { error: null };
}
