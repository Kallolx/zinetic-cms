import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { transcribe } from "@/lib/studio/elevenlabs";
import { cut, duration, extractAudio, hasVideo, workDir } from "@/lib/studio/ffmpeg";
import { pickClips } from "@/lib/studio/editing";
import { begin, fail, failGeneration, finishWithFile, requireStudioUser, tooBig, uploadedFile } from "@/lib/studio/run";

export const runtime = "nodejs";
export const maxDuration = 600;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const video = uploadedFile(form, "video");
  if (!video) return fail("Upload a video.");
  if (tooBig(video)) return fail("That file is too large.");
  const count = Math.min(10, Math.max(1, Number(form.get("count")) || 3));
  const target = Math.min(90, Math.max(15, Number(form.get("length")) || 45));
  const vertical = form.get("format") !== "original";

  const work = await workDir();
  try {
    const input = path.join(work.dir, "in" + (path.extname(video.name) || ".mp4"));
    await fs.writeFile(input, Buffer.from(await video.arrayBuffer()));
    if (!(await hasVideo(input))) throw new Error("That file has no video.");

    const audio = path.join(work.dir, "audio.mp3");
    await extractAudio(input, audio);
    const t = await transcribe({ file: new Blob([await fs.readFile(audio)]), filename: "audio.mp3", diarize: false });
    if (!t.ok) throw new Error(t.error);

    const total = await duration(input);
    const clips = pickClips(t.transcript.words, { count, target });
    if (clips.length === 0) throw new Error("Could not find enough speech in this video to make clips.");

    const ids: string[] = [];
    for (let i = 0; i < clips.length; i++) {
      const c = clips[i];
      const title = `${video.name} · clip ${i + 1} (${clock(c.start)}-${clock(c.end)})`;
      const g = await begin(auth.userId, "short-clips", "local", title, { filename: video.name, start: c.start, end: c.end, vertical });
      try {
        const output = path.join(work.dir, `clip-${i}.mp4`);
        await cut(input, [{ start: c.start, end: Math.min(c.end, total) }], output, { vertical, dir: work.dir });
        await finishWithFile(g, await fs.readFile(output), "video/mp4", { text: c.text, start: c.start, end: c.end });
        ids.push(g.id);
      } catch (e) {
        await failGeneration(g, e instanceof Error ? e.message : "Failed");
      }
    }
    if (ids.length === 0) throw new Error("Could not cut the clips.");
    return NextResponse.json({ id: ids[0], ids });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return fail(message, 502);
  } finally {
    await work.done();
  }
}
