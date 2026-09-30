import { spawn } from "child_process";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import os from "os";
import path from "path";
import ffmpegPath from "ffmpeg-static";

export type Range = { start: number; end: number };

/** Scratch directory for one job, removed when `done()` is called. */
export async function workDir() {
  const dir = path.join(os.tmpdir(), `studio-${randomUUID()}`);
  await fs.mkdir(dir, { recursive: true });
  return { dir, done: () => fs.rm(dir, { recursive: true, force: true }) };
}

function run(args: string[]): Promise<{ code: number; stderr: string }> {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return reject(new Error("ffmpeg is not available on this server."));
    const p = spawn(ffmpegPath, ["-hide_banner", "-y", ...args]);
    let stderr = "";
    p.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > 20000) stderr = stderr.slice(-10000);
    });
    p.on("error", reject);
    p.on("close", (code) => resolve({ code: code ?? 1, stderr }));
  });
}

/** Mono 16 kHz MP3: small enough to send to the transcriber quickly. */
export async function extractAudio(input: string, output: string) {
  const r = await run(["-i", input, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "48k", output]);
  if (r.code !== 0) throw new Error("Could not read the audio in that file.");
}

export async function duration(input: string): Promise<number> {
  // ffmpeg exits non-zero with no output file, but still prints the duration
  const r = await run(["-i", input]);
  const m = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(r.stderr);
  if (!m) throw new Error("Could not read that video.");
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

export async function hasVideo(input: string): Promise<boolean> {
  const r = await run(["-i", input]);
  return /Stream #\d+:\d+.*Video:/.test(r.stderr);
}

/**
 * Joins the given ranges of the input into one mp4. `vertical` also crops the
 * picture to 9:16 (the centre of the frame) for Shorts, Reels and TikTok.
 */
export async function cut(input: string, ranges: Range[], output: string, opts: { vertical?: boolean; dir: string }) {
  if (ranges.length === 0) throw new Error("Nothing to keep.");
  const parts: string[] = [];
  ranges.forEach((r, i) => {
    parts.push(`[0:v]trim=start=${r.start.toFixed(3)}:end=${r.end.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
    parts.push(`[0:a]atrim=start=${r.start.toFixed(3)}:end=${r.end.toFixed(3)},asetpts=PTS-STARTPTS[a${i}]`);
  });
  const inputs = ranges.map((_, i) => `[v${i}][a${i}]`).join("");
  parts.push(`${inputs}concat=n=${ranges.length}:v=1:a=1[cv][a]`);
  parts.push(opts.vertical ? `[cv]crop='min(iw,ih*9/16)':ih,scale=1080:1920,setsar=1[v]` : `[cv]null[v]`);

  // the filter graph can be huge (one pair per kept segment), so it goes in a file
  const script = path.join(opts.dir, `graph-${randomUUID()}.txt`);
  await fs.writeFile(script, parts.join(";\n"));
  const r = await run([
    "-i", input,
    "-filter_complex_script", script,
    "-map", "[v]", "-map", "[a]",
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
    output,
  ]);
  if (r.code !== 0) throw new Error("Editing the video failed.");
}
