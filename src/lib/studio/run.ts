import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { getMyProducts } from "@/lib/products-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveFile } from "@/lib/studio/storage";

export const MAX_UPLOAD_MB = 200;

export async function requireStudioUser() {
  const { user, profile } = await getDashboardSession();
  if (!user || !profile || profile.status !== "approved") {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }
  if (!(await getMyProducts(user.id)).has("studio")) {
    return {
      error: NextResponse.json({ error: "Your account does not include AI Studio." }, { status: 403 }),
    } as const;
  }
  return { userId: user.id } as const;
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function uploadedFile(form: FormData, field: string) {
  const f = form.get(field);
  if (!(f instanceof File) || f.size === 0) return null;
  return f;
}

export const tooBig = (f: File) => f.size > MAX_UPLOAD_MB * 1024 * 1024;

const EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "video/mp4": "mp4",
  "audio/mp4": "m4a",
  "video/webm": "webm",
  "audio/webm": "webm",
};
export const extFor = (mime: string) => EXT[mime.split(";")[0].trim()] ?? "bin";

export type Generation = {
  id: string;
  userId: string;
  kind: string;
  provider: string;
  title: string;
};

/** Creates a generation row in "processing" state. */
export async function begin(
  userId: string,
  kind: string,
  provider: string,
  title: string,
  input: Record<string, unknown>,
  providerJobId?: string
): Promise<Generation> {
  const id = randomUUID();
  await createAdminClient()
    .from("studio_generations")
    .insert({ id, user_id: userId, kind, provider, title, input, provider_job_id: providerJobId ?? null });
  return { id, userId, kind, provider, title };
}

export async function finishWithFile(g: Generation, data: Buffer, mime: string, result?: unknown) {
  const key = `${g.userId}/${g.id}.${extFor(mime)}`;
  await saveFile(key, data);
  await createAdminClient()
    .from("studio_generations")
    .update({ status: "done", file_key: key, mime_type: mime, result: result ?? null })
    .eq("id", g.id);
}

export async function finishWithResult(g: Generation, result: unknown) {
  await createAdminClient().from("studio_generations").update({ status: "done", result }).eq("id", g.id);
}

export async function failGeneration(g: { id: string }, error: string) {
  await createAdminClient().from("studio_generations").update({ status: "failed", error }).eq("id", g.id);
}
