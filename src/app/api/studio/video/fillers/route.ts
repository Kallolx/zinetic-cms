import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { transcribe } from "@/lib/studio/elevenlabs";
import { cut, duration, extractAudio, hasVideo, workDir } from "@/lib/studio/ffmpeg";
import { fillerRanges, invert, merge, pauseRanges, span } from "@/lib/studio/editing";
import { begin, fail, failGeneration, finishWithFile, requireStudioUser, tooBig, uploadedFile } from "@/lib/studio/run";

export const runtime = "nodejs";
export const maxDuration = 600;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const video = uploadedFile(form, "video");
  if (!video) return fail("Upload a video.");
  if (tooBig(video)) return fail("That file is too large.");
  const removeFillers = form.get("fillers") !== "false";
  const gap = Number(form.get("pauses") ?? 0); // seconds, 0 = leave pauses alone
  if (!removeFillers && !gap) return fail("Choose at least one thing to remove.");

  const g = await begin(auth.userId, "filler-remover", "elevenlabs", video.name, { filename: video.name, removeFillers, gap });
  const work = await workDir();
  try {
    const input = path.join(work.dir, "in" + (path.extname(video.name) || ".mp4"));
    await fs.writeFile(input, Buffer.from(await video.arrayBuffer()));
    if (!(await hasVideo(input))) throw new Error("That file has no video. Use Audio cleaner for audio files.");

    const audio = path.join(work.dir, "audio.mp3");
    await extractAudio(input, audio);
    const t = await transcribe({ file: new Blob([await fs.readFile(audio)]), filename: "audio.mp3", diarize: false });
    if (!t.ok) throw new Error(t.error);

    const total = await duration(input);
    const fillers = removeFillers ? fillerRanges(t.transcript.words) : [];
    const pauses = gap ? pauseRanges(t.transcript.words, gap) : [];
    const remove = merge([...fillers, ...pauses]);
    if (remove.length === 0) throw new Error("No filler words or long pauses were found in this video.");

    const output = path.join(work.dir, "out.mp4");
    await cut(input, invert(remove, total), output, { dir: work.dir });

    const saved = span(remove);
    await finishWithFile(g, await fs.readFile(output), "video/mp4", {
      fillers: fillers.length,
      pauses: pauses.length,
      savedSeconds: Math.round(saved * 10) / 10,
      originalSeconds: Math.round(total * 10) / 10,
    });
    return NextResponse.json({ id: g.id, fillers: fillers.length, pauses: pauses.length, savedSeconds: Math.round(saved * 10) / 10, originalSeconds: Math.round(total * 10) / 10 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    await failGeneration(g, message);
    return fail(message, 502);
  } finally {
    await work.done();
  }
}
