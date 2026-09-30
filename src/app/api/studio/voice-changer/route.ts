import { NextResponse } from "next/server";
import { voiceChanger } from "@/lib/studio/elevenlabs";
import { authorize, begin, fail, failGeneration, finishWithFile, mb, mediaSeconds, requireStudioUser, tooBig, uploadedFile } from "@/lib/studio/run";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = uploadedFile(form, "audio");
  const voiceId = String(form.get("voiceId") ?? "");
  if (!file || !voiceId) return fail("Upload a recording and pick the voice to change it into.");
  if (tooBig(file)) return fail("That file is too large.");

  const z = await authorize(auth.userId, "voice-changer", String(form.get("engine") ?? ""), { seconds: await mediaSeconds(file), fileMb: mb(file) }, "Voice changer");
  if ("error" in z) return z.error;

  const g = await begin(auth.userId, "voice-changer", z.authz.engine.provider, file.name, { voiceId, filename: file.name }, undefined, z.authz);
  const r = await voiceChanger({ audio: file, filename: file.name, voiceId, modelId: z.authz.engine.model ?? undefined });
  if (!r.ok) {
    await failGeneration(g, r.error);
    return fail(r.error, 502);
  }
  await finishWithFile(g, r.audio, r.mime);
  return NextResponse.json({ id: g.id });
}
