import { NextResponse } from "next/server";
import { generateFromPrompt } from "@/lib/studio/heygen";
import { begin, fail, requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const b = (await request.json().catch(() => null)) as { prompt?: string } | null;
  const prompt = b?.prompt?.trim() ?? "";
  if (!prompt) return fail("Describe the video you want.");

  const job = await generateFromPrompt(prompt);
  if (!job.ok) return fail(job.error, 502);
  const g = await begin(auth.userId, "prompt-video", "heygen", prompt.slice(0, 80), { prompt }, job.videoId);
  return NextResponse.json({ id: g.id });
}
