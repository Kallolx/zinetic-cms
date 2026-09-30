const BASE = "https://api.elevenlabs.io/v1";

export type Voice = { id: string; name: string; category?: string; previewUrl?: string; labels?: string };

export const hasElevenLabs = () => Boolean(process.env.ELEVENLABS_API_KEY);

type Ok<T> = { ok: true } & T;
type Fail = { ok: false; error: string };
export type AudioResult = Ok<{ audio: Buffer; mime: string }> | Fail;

const key = () => process.env.ELEVENLABS_API_KEY;
const NOT_CONFIGURED: Fail = { ok: false, error: "ElevenLabs is not configured yet." };

async function readError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { detail?: { message?: string } | string };
    const d = j.detail;
    const msg = typeof d === "string" ? d : d?.message;
    if (msg) return msg;
  } catch {}
  return `ElevenLabs returned ${res.status}.`;
}

async function audioCall(url: string, init: RequestInit): Promise<AudioResult> {
  const k = key();
  if (!k) return NOT_CONFIGURED;
  try {
    const res = await fetch(url, { ...init, headers: { "xi-api-key": k, ...(init.headers ?? {}) } });
    if (!res.ok) return { ok: false, error: await readError(res) };
    return {
      ok: true,
      audio: Buffer.from(await res.arrayBuffer()),
      mime: res.headers.get("content-type") ?? "audio/mpeg",
    };
  } catch {
    return { ok: false, error: "Could not reach ElevenLabs." };
  }
}

export async function listVoices(): Promise<Voice[]> {
  const k = key();
  if (!k) return [];
  try {
    const res = await fetch(`${BASE}/voices`, { headers: { "xi-api-key": k }, next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      voices: {
        voice_id: string;
        name: string;
        category?: string;
        preview_url?: string;
        labels?: Record<string, string>;
      }[];
    };
    return json.voices.map((v) => ({
      id: v.voice_id,
      name: v.name,
      category: v.category,
      previewUrl: v.preview_url,
      labels: v.labels ? Object.values(v.labels).filter(Boolean).slice(0, 3).join(" · ") : undefined,
    }));
  } catch {
    return [];
  }
}

export function textToSpeech(opts: { text: string; voiceId: string; modelId?: string }) {
  return audioCall(`${BASE}/text-to-speech/${encodeURIComponent(opts.voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text: opts.text, model_id: opts.modelId ?? "eleven_multilingual_v2" }),
  });
}

export function voiceChanger(opts: { audio: Blob; filename: string; voiceId: string; modelId?: string }) {
  const form = new FormData();
  form.append("audio", opts.audio, opts.filename);
  form.append("model_id", opts.modelId ?? "eleven_multilingual_sts_v2");
  return audioCall(`${BASE}/speech-to-speech/${encodeURIComponent(opts.voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    body: form,
  });
}

export function soundEffect(opts: { text: string; durationSeconds?: number; loop?: boolean; modelId?: string }) {
  return audioCall(`${BASE}/sound-generation?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: opts.text,
      model_id: opts.modelId ?? "eleven_text_to_sound_v2",
      ...(opts.durationSeconds ? { duration_seconds: opts.durationSeconds } : {}),
      ...(opts.loop ? { loop: true } : {}),
    }),
  });
}

export function composeMusic(opts: { prompt: string; seconds: number; modelId?: string }) {
  return audioCall(`${BASE}/music?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: opts.prompt, music_length_ms: Math.round(opts.seconds * 1000), ...(opts.modelId ? { model_id: opts.modelId } : {}) }),
  });
}

export function isolateAudio(opts: { audio: Blob; filename: string }) {
  const form = new FormData();
  form.append("audio", opts.audio, opts.filename);
  return audioCall(`${BASE}/audio-isolation`, { method: "POST", body: form });
}

export type Transcript = {
  language: string;
  text: string;
  words: { text: string; start: number; end: number; speaker?: string }[];
};

export async function transcribe(opts: {
  file: Blob;
  filename: string;
  language?: string;
  diarize?: boolean;
  modelId?: string;
}): Promise<Ok<{ transcript: Transcript }> | Fail> {
  const k = key();
  if (!k) return NOT_CONFIGURED;
  const form = new FormData();
  form.append("file", opts.file, opts.filename);
  form.append("model_id", opts.modelId ?? "scribe_v1");
  form.append("timestamps_granularity", "word");
  form.append("tag_audio_events", "false");
  if (opts.diarize) form.append("diarize", "true");
  if (opts.language) form.append("language_code", opts.language);
  try {
    const res = await fetch(`${BASE}/speech-to-text`, { method: "POST", headers: { "xi-api-key": k }, body: form });
    if (!res.ok) return { ok: false, error: await readError(res) };
    const j = (await res.json()) as {
      language_code?: string;
      text: string;
      words?: { text: string; start: number; end: number; type: string; speaker_id?: string }[];
    };
    return {
      ok: true,
      transcript: {
        language: j.language_code ?? "",
        text: j.text,
        words: (j.words ?? [])
          .filter((w) => w.type === "word")
          .map((w) => ({ text: w.text, start: w.start, end: w.end, speaker: w.speaker_id })),
      },
    };
  } catch {
    return { ok: false, error: "Could not reach ElevenLabs." };
  }
}

export async function startDubbing(opts: {
  file: Blob;
  filename: string;
  targetLang: string;
}): Promise<Ok<{ dubbingId: string }> | Fail> {
  const k = key();
  if (!k) return NOT_CONFIGURED;
  const form = new FormData();
  form.append("file", opts.file, opts.filename);
  form.append("target_lang", opts.targetLang);
  form.append("source_lang", "auto");
  form.append("num_speakers", "0");
  form.append("watermark", "false");
  try {
    const res = await fetch(`${BASE}/dubbing`, { method: "POST", headers: { "xi-api-key": k }, body: form });
    if (!res.ok) return { ok: false, error: await readError(res) };
    const j = (await res.json()) as { dubbing_id: string };
    return { ok: true, dubbingId: j.dubbing_id };
  } catch {
    return { ok: false, error: "Could not reach ElevenLabs." };
  }
}

export async function dubbingStatus(id: string): Promise<{ status: "processing" | "done" | "failed"; error?: string }> {
  const k = key();
  if (!k) return { status: "failed", error: "ElevenLabs is not configured." };
  try {
    const res = await fetch(`${BASE}/dubbing/${encodeURIComponent(id)}`, { headers: { "xi-api-key": k } });
    if (!res.ok) return { status: "processing" };
    const j = (await res.json()) as { status: string; error?: string };
    if (j.status === "dubbed") return { status: "done" };
    if (j.status === "failed") return { status: "failed", error: j.error ?? "Dubbing failed." };
    return { status: "processing" };
  } catch {
    return { status: "processing" };
  }
}

export function downloadDub(id: string, lang: string) {
  return audioCall(`${BASE}/dubbing/${encodeURIComponent(id)}/audio/${encodeURIComponent(lang)}`, { method: "GET" });
}
