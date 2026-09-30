import { NextResponse } from "next/server";
import { transcribe } from "@/lib/studio/elevenlabs";
import { begin, fail, failGeneration, finishWithResult, requireStudioUser, tooBig, uploadedFile } from "@/lib/studio/run";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = uploadedFile(form, "file");
  if (!file) return fail("Upload an audio or video file.");
  if (tooBig(file)) return fail("That file is too large.");
  const language = String(form.get("language") ?? "") || undefined;
  const diarize = form.get("diarize") !== "false";

  const g = await begin(auth.userId, "transcribe", "elevenlabs", file.name, { filename: file.name, language, diarize });
  const r = await transcribe({ file, filename: file.name, language, diarize });
  if (!r.ok) {
    await failGeneration(g, r.error);
    return fail(r.error, 502);
  }
  await finishWithResult(g, r.transcript);
  return NextResponse.json({ id: g.id, transcript: r.transcript });
}
