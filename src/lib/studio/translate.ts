import { startDubbing } from "@/lib/studio/elevenlabs";
import { translateVideo, uploadAsset } from "@/lib/studio/heygen";

export type TranslationJob = { ok: true; provider: "elevenlabs" | "heygen"; jobId: string } | { ok: false; error: string };

/**
 * Dubbing and video translation are the same job on two providers, so both
 * tools start it here. The engine's provider decides who runs it.
 */
export async function startTranslation(opts: {
  provider: string;
  file: File;
  language: string;
  lipsync: boolean;
}): Promise<TranslationJob> {
  if (opts.provider === "elevenlabs") {
    const r = await startDubbing({ file: opts.file, filename: opts.file.name, targetLang: opts.language });
    return r.ok ? { ok: true, provider: "elevenlabs", jobId: r.dubbingId } : r;
  }
  if (opts.provider === "heygen") {
    if (!opts.file.type.startsWith("video")) return { ok: false, error: "This engine needs a video file. Audio files work with the other engine." };
    const up = await uploadAsset(opts.file, opts.file.type || "video/mp4");
    if (!up.ok) return up;
    const r = await translateVideo({ videoUrl: up.url, language: opts.language, audioOnly: !opts.lipsync });
    return r.ok ? { ok: true, provider: "heygen", jobId: r.translateId } : r;
  }
  return { ok: false, error: "This engine is not available." };
}
