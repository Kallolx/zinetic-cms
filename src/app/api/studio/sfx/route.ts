import { NextResponse } from "next/server";
import { soundEffect } from "@/lib/studio/elevenlabs";
import { begin, fail, failGeneration, finishWithFile, requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const b = (await request.json().catch(() => null)) as { text?: string; seconds?: number; loop?: boolean } | null;
  const text = b?.text?.trim() ?? "";
  if (!text) return fail("Describe the sound you need.");
  const seconds = b?.seconds ? Math.min(30, Math.max(0.5, Number(b.seconds))) : undefined;

  const g = await begin(auth.userId, "sfx", "elevenlabs", text.slice(0, 80), { text, seconds, loop: Boolean(b?.loop) });
  const r = await soundEffect({ text, durationSeconds: seconds, loop: b?.loop });
  if (!r.ok) {
    await failGeneration(g, r.error);
    return fail(r.error, 502);
  }
  await finishWithFile(g, r.audio, r.mime);
  return NextResponse.json({ id: g.id });
}
