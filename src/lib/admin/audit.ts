import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Writes one line in the admin audit log. Never lets a logging problem stop the
 * action itself, the action has already happened by the time this is called.
 */
export async function audit(
  admin: { id: string; email?: string },
  action: string,
  target: { id?: string | null; label?: string | null } | null,
  detail: Record<string, unknown> = {}
) {
  try {
    await createAdminClient().from("admin_audit").insert({
      admin_id: admin.id,
      admin_email: admin.email ?? null,
      action,
      target_user: target?.id ?? null,
      target_label: target?.label ?? null,
      detail,
    });
  } catch {}
}

/** "Jane Doe (jane@x.com)" for the log, looked up once. */
export async function labelFor(userId: string): Promise<string> {
  const { data } = await createAdminClient().from("profiles").select("full_name, email").eq("id", userId).maybeSingle();
  return data ? `${data.full_name ?? data.email} (${data.email})` : userId;
}
