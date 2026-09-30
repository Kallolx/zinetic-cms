import { NextResponse } from "next/server";
import { textToSpeech } from "@/lib/studio/elevenlabs";
import { authorize, begin, fail, failGeneration, finishWithFile, requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as { text?: string; voiceId?: string; engine?: string } | null;
  const text = body?.text?.trim() ?? "";
  const voiceId = body?.voiceId?.trim() ?? "";
  if (!text || !voiceId) return fail("Enter some text and pick a voice.");

  const z = await authorize(auth.userId, "voice", body?.engine, { chars: text.length }, "Voice generator");
  if ("error" in z) return z.error;

  const g = await begin(auth.userId, "voice", z.authz.engine.provider, text.slice(0, 80), { text, voiceId }, undefined, z.authz);
  const r = await textToSpeech({ text, voiceId, modelId: z.authz.engine.model ?? undefined });
  if (!r.ok) {
    await failGeneration(g, r.error);
    return fail(r.error, 502);
  }
  await finishWithFile(g, r.audio, r.mime);
  return NextResponse.json({ id: g.id });
}
