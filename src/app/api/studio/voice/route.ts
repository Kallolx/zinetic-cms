import { NextResponse } from "next/server";
import { textToSpeech } from "@/lib/studio/elevenlabs";
import { begin, fail, failGeneration, finishWithFile, requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";
const MAX_CHARS = 5000;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const body = (await request.json().catch(() => null)) as { text?: string; voiceId?: string } | null;
  const text = body?.text?.trim() ?? "";
  const voiceId = body?.voiceId?.trim() ?? "";
  if (!text || !voiceId) return fail("Enter some text and pick a voice.");
  if (text.length > MAX_CHARS) return fail(`Keep it under ${MAX_CHARS} characters.`);

  const g = await begin(auth.userId, "voice", "elevenlabs", text.slice(0, 80), { text, voiceId });
  const r = await textToSpeech({ text, voiceId });
  if (!r.ok) {
    await failGeneration(g, r.error);
    return fail(r.error, 502);
  }
  await finishWithFile(g, r.audio, r.mime);
  return NextResponse.json({ id: g.id });
}
