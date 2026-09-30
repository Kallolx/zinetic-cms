import { NextResponse } from "next/server";
import { composeMusic } from "@/lib/studio/elevenlabs";
import { begin, fail, failGeneration, finishWithFile, requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const b = (await request.json().catch(() => null)) as { prompt?: string; seconds?: number } | null;
  const prompt = b?.prompt?.trim() ?? "";
  if (!prompt) return fail("Describe the song you want.");
  const seconds = Math.min(120, Math.max(10, Number(b?.seconds) || 30));

  const g = await begin(auth.userId, "music", "elevenlabs", prompt.slice(0, 80), { prompt, seconds });
  const r = await composeMusic({ prompt, seconds });
  if (!r.ok) {
    await failGeneration(g, r.error);
    return fail(r.error, 502);
  }
  await finishWithFile(g, r.audio, r.mime);
  return NextResponse.json({ id: g.id });
}
