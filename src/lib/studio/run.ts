import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { getMyProducts } from "@/lib/products-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveFile } from "@/lib/studio/storage";
import { charge, costFor, limitError, refund, resolveEngine, type Engine, type Usage } from "@/lib/studio/engines";
import { providerSupports } from "@/lib/studio/engine-catalog";
import { duration, workDir } from "@/lib/studio/ffmpeg";
import { promises as fs } from "fs";
import path from "path";

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
  providerJobId?: string,
  authz?: Authz
): Promise<Generation> {
  const id = randomUUID();
  await createAdminClient()
    .from("studio_generations")
    .insert({
      id,
      user_id: userId,
      kind,
      provider,
      title,
      input,
      provider_job_id: providerJobId ?? null,
      engine_key: authz?.engine.key ?? null,
      credits: authz?.credits ?? 0,
    });
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

/** Marks a run failed and gives the customer their credits back (once). */
export async function failGeneration(g: { id: string }, error: string) {
  const db = createAdminClient();
  await db.from("studio_generations").update({ status: "failed", error }).eq("id", g.id);
  const { data } = await db.from("studio_generations").select("user_id, credits, refunded, title").eq("id", g.id).single();
  if (data && Number(data.credits) > 0 && !data.refunded) {
    const { data: claimed } = await db.from("studio_generations").update({ refunded: true }).eq("id", g.id).eq("refunded", false).select("id");
    if (claimed && claimed.length > 0) await refund(data.user_id, Number(data.credits), `AI Studio refund: ${data.title ?? g.id}`);
  }
}

export type Authz = { engine: Engine; credits: number; userId: string };

/**
 * Picks the engine, checks its limits and takes the credits up front. Call this
 * before talking to the provider. If the provider then fails, call failGeneration
 * (or refundAuthz when no row exists yet) so the customer is not charged.
 */
export async function authorize(
  userId: string,
  service: string,
  engineKey: string | null | undefined,
  usage: Usage,
  label: string
): Promise<{ error: NextResponse } | { authz: Authz }> {
  const r = await resolveEngine(service, engineKey);
  if ("error" in r) return { error: fail(r.error) };
  if (!providerSupports(r.engine.provider, service)) return { error: fail("This engine is not set up correctly. Please contact support.", 500) };
  const limit = limitError(r.engine, usage);
  if (limit) return { error: fail(limit) };
  const credits = costFor(r.engine, usage);
  const paid = await charge(userId, credits, `AI Studio: ${label}`);
  if (!paid.ok) return { error: fail(`Not enough AI Studio balance. This costs ${credits} credits, add credits in Wallet.`, 402) };
  return { authz: { engine: r.engine, credits, userId } };
}

export const refundAuthz = (a: Authz, label: string) => refund(a.userId, a.credits, `AI Studio refund: ${label}`);

/** Length of an uploaded audio or video file in seconds, or undefined if it cannot be read. */
export async function mediaSeconds(file: File): Promise<number | undefined> {
  const work = await workDir();
  try {
    const p = path.join(work.dir, "probe" + (path.extname(file.name) || ".bin"));
    await fs.writeFile(p, Buffer.from(await file.arrayBuffer()));
    return await duration(p);
  } catch {
    return undefined;
  } finally {
    await work.done();
  }
}

export const mb = (f: File) => f.size / 1024 / 1024;
