const BASE = "https://api.elevenlabs.io/v1";

export type Voice = { id: string; name: string; category?: string; previewUrl?: string };

export const hasElevenLabs = () => Boolean(process.env.ELEVENLABS_API_KEY);

export async function listVoices(): Promise<Voice[]> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return [];
  try {
    const res = await fetch(`${BASE}/voices`, { headers: { "xi-api-key": key }, next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      voices: { voice_id: string; name: string; category?: string; preview_url?: string }[];
    };
    return json.voices.map((v) => ({ id: v.voice_id, name: v.name, category: v.category, previewUrl: v.preview_url }));
  } catch {
    return [];
  }
}

export type TtsResult = { ok: true; audio: Buffer; mime: string } | { ok: false; error: string };

export async function textToSpeech(opts: { text: string; voiceId: string; modelId?: string }): Promise<TtsResult> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return { ok: false, error: "ElevenLabs is not configured yet." };
  try {
    const res = await fetch(`${BASE}/text-to-speech/${encodeURIComponent(opts.voiceId)}?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text: opts.text, model_id: opts.modelId ?? "eleven_multilingual_v2" }),
    });
    if (!res.ok) return { ok: false, error: `ElevenLabs returned ${res.status}.` };
    return { ok: true, audio: Buffer.from(await res.arrayBuffer()), mime: "audio/mpeg" };
  } catch {
    return { ok: false, error: "Could not reach ElevenLabs." };
  }
}
