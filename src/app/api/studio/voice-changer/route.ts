import { NextResponse } from "next/server";
import { voiceChanger } from "@/lib/studio/elevenlabs";
import { begin, fail, failGeneration, finishWithFile, requireStudioUser, tooBig, uploadedFile } from "@/lib/studio/run";

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

  const g = await begin(auth.userId, "voice-changer", "elevenlabs", file.name, { voiceId, filename: file.name });
  const r = await voiceChanger({ audio: file, filename: file.name, voiceId });
  if (!r.ok) {
    await failGeneration(g, r.error);
    return fail(r.error, 502);
  }
  await finishWithFile(g, r.audio, r.mime);
  return NextResponse.json({ id: g.id });
}
