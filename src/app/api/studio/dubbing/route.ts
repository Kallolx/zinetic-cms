import { NextResponse } from "next/server";
import { startDubbing } from "@/lib/studio/elevenlabs";
import { begin, fail, requireStudioUser, tooBig, uploadedFile } from "@/lib/studio/run";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = uploadedFile(form, "file");
  const targetLang = String(form.get("targetLang") ?? "");
  if (!file || !targetLang) return fail("Upload a file and choose the language to dub into.");
  if (tooBig(file)) return fail("That file is too large.");

  const r = await startDubbing({ file, filename: file.name, targetLang });
  if (!r.ok) return fail(r.error, 502);

  // processing rows are finished by /api/studio/jobs/[id]
  const g = await begin(auth.userId, "dubbing", "elevenlabs", file.name, { filename: file.name, targetLang }, r.dubbingId);
  return NextResponse.json({ id: g.id });
}
