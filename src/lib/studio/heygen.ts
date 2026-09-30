const API = "https://api.heygen.com";
const UPLOAD = "https://upload.heygen.com";

export const hasHeyGen = () => Boolean(process.env.HEYGEN_API_KEY);

type Fail = { ok: false; error: string };
type Ok<T> = { ok: true } & T;

const key = () => process.env.HEYGEN_API_KEY;
const NOT_CONFIGURED: Fail = { ok: false, error: "HeyGen is not configured yet." };

type Envelope<T> = { data?: T; error?: { message?: string; code?: string } | string | null; message?: string };

async function call<T>(path: string, init: RequestInit = {}, base = API): Promise<Ok<{ data: T }> | Fail> {
  const k = key();
  if (!k) return NOT_CONFIGURED;
  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: { "x-api-key": k, Accept: "application/json", ...(init.headers ?? {}) },
      cache: "no-store",
    });
    const json = (await res.json().catch(() => ({}))) as Envelope<T>;
    if (!res.ok || json.error) {
      const e = json.error;
      const msg = typeof e === "string" ? e : (e?.message ?? json.message);
      return { ok: false, error: msg || `HeyGen returned ${res.status}.` };
    }
    return { ok: true, data: json.data as T };
  } catch {
    return { ok: false, error: "Could not reach HeyGen." };
  }
}

const post = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

export type Avatar = { id: string; name: string; gender?: string; preview: string };
export type HeyGenVoice = { id: string; name: string; language: string; gender?: string; preview?: string };

export async function listAvatars(): Promise<Avatar[]> {
  const r = await call<{
    avatars: { avatar_id: string; avatar_name: string; gender?: string; preview_image_url: string }[];
  }>("/v2/avatars");
  if (!r.ok) return [];
  return r.data.avatars.map((a) => ({ id: a.avatar_id, name: a.avatar_name, gender: a.gender, preview: a.preview_image_url }));
}

export async function listVoices(): Promise<HeyGenVoice[]> {
  const r = await call<{
    voices: { voice_id: string; name: string; language: string; gender?: string; preview_audio?: string }[];
  }>("/v2/voices");
  if (!r.ok) return [];
  return r.data.voices.map((v) => ({
    id: v.voice_id,
    name: v.name,
    language: v.language,
    gender: v.gender,
    preview: v.preview_audio,
  }));
}

export async function listTranslateLanguages(): Promise<string[]> {
  const r = await call<{ languages: string[] }>("/v2/video_translate/target_languages");
  return r.ok ? r.data.languages : [];
}

/** Uploads a file to HeyGen's asset store so it can be referenced by URL or key. */
export async function uploadAsset(
  file: Blob,
  mime: string
): Promise<Ok<{ url: string; imageKey?: string; id?: string }> | Fail> {
  const r = await call<{ id?: string; url: string; image_key?: string }>(
    "/v1/asset",
    { method: "POST", headers: { "Content-Type": mime }, body: file },
    UPLOAD
  );
  if (!r.ok) return r;
  return { ok: true, url: r.data.url, imageKey: r.data.image_key, id: r.data.id };
}

export type VideoJob = Ok<{ videoId: string }> | Fail;

export async function generateAvatarVideo(opts: {
  avatarId: string;
  voiceId: string;
  script: string;
  ratio: "16:9" | "9:16" | "1:1";
}): Promise<VideoJob> {
  const dims = { "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [1080, 1080] }[opts.ratio];
  const r = await call<{ video_id: string }>(
    "/v2/video/generate",
    post({
      video_inputs: [
        {
          character: { type: "avatar", avatar_id: opts.avatarId, avatar_style: "normal" },
          voice: { type: "text", input_text: opts.script, voice_id: opts.voiceId },
        },
      ],
      dimension: { width: dims[0], height: dims[1] },
    })
  );
  return r.ok ? { ok: true, videoId: r.data.video_id } : r;
}

/** A talking video from a still photo (Avatar IV). */
export async function generatePhotoVideo(opts: { imageKey: string; voiceId: string; script: string }): Promise<VideoJob> {
  const r = await call<{ video_id: string }>(
    "/v2/video/av4/generate",
    post({ image_key: opts.imageKey, video_title: "Studio video", script: opts.script, voice_id: opts.voiceId })
  );
  return r.ok ? { ok: true, videoId: r.data.video_id } : r;
}

export async function generateFromPrompt(prompt: string): Promise<VideoJob> {
  const r = await call<{ video_id: string }>("/v1/video_agent/generate", post({ prompt }));
  return r.ok ? { ok: true, videoId: r.data.video_id } : r;
}

export async function translateVideo(opts: {
  videoUrl: string;
  language: string;
  audioOnly?: boolean;
}): Promise<Ok<{ translateId: string }> | Fail> {
  const r = await call<{ video_translate_id: string }>(
    "/v2/video_translate",
    post({
      video_url: opts.videoUrl,
      output_language: opts.language,
      title: "Studio translation",
      translate_audio_only: Boolean(opts.audioOnly),
    })
  );
  return r.ok ? { ok: true, translateId: r.data.video_translate_id } : r;
}

export type JobState = { status: "processing" | "done" | "failed"; url?: string; error?: string };

export async function videoStatus(videoId: string): Promise<JobState> {
  const r = await call<{ status: string; video_url?: string; error?: { message?: string } | string | null }>(
    `/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`
  );
  if (!r.ok) return { status: "processing" };
  if (r.data.status === "completed" && r.data.video_url) return { status: "done", url: r.data.video_url };
  if (r.data.status === "failed") {
    const e = r.data.error;
    return { status: "failed", error: (typeof e === "string" ? e : e?.message) || "HeyGen could not make this video." };
  }
  return { status: "processing" };
}

export async function translateStatus(id: string): Promise<JobState> {
  const r = await call<{ status: string; url?: string; message?: string }>(
    `/v2/video_translate/${encodeURIComponent(id)}`
  );
  if (!r.ok) return { status: "processing" };
  if (r.data.status === "success" && r.data.url) return { status: "done", url: r.data.url };
  if (r.data.status === "failed") return { status: "failed", error: r.data.message || "Translation failed." };
  return { status: "processing" };
}
