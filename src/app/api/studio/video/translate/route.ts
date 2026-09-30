import { NextResponse } from "next/server";
import { translateVideo, uploadAsset } from "@/lib/studio/heygen";
import { begin, fail, requireStudioUser, tooBig, uploadedFile } from "@/lib/studio/run";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const video = uploadedFile(form, "video");
  const language = String(form.get("language") ?? "");
  const lipsync = form.get("lipsync") !== "false";
  if (!video || !language) return fail("Upload a video and choose a language.");
  if (tooBig(video)) return fail("That file is too large.");

  const up = await uploadAsset(video, video.type || "video/mp4");
  if (!up.ok) return fail(up.error, 502);
  const job = await translateVideo({ videoUrl: up.url, language, audioOnly: !lipsync });
  if (!job.ok) return fail(job.error, 502);

  const g = await begin(
    auth.userId,
    lipsync ? "translation-lipsync" : "video-translation",
    "heygen",
    video.name,
    { filename: video.name, language, lipsync },
    job.translateId
  );
  return NextResponse.json({ id: g.id });
}
