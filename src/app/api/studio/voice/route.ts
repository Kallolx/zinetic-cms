import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveFile } from "@/lib/studio/storage";
import { textToSpeech } from "@/lib/studio/elevenlabs";

export const runtime = "nodejs";
const MAX_CHARS = 2500;

export async function POST(request: Request) {
  const { user, profile } = await getDashboardSession();
  if (!user || !profile || profile.status !== "approved") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { text?: string; voiceId?: string } | null;
  const text = body?.text?.trim() ?? "";
  const voiceId = body?.voiceId?.trim() ?? "";
  if (!text || !voiceId) return NextResponse.json({ error: "Enter some text and pick a voice." }, { status: 400 });
  if (text.length > MAX_CHARS) {
    return NextResponse.json({ error: `Keep it under ${MAX_CHARS} characters.` }, { status: 400 });
  }

  const db = createAdminClient();
  const id = randomUUID();
  await db
    .from("studio_generations")
    .insert({ id, user_id: user.id, kind: "voice", provider: "elevenlabs", input: { text, voiceId } });

  const result = await textToSpeech({ text, voiceId });
  if (!result.ok) {
    await db.from("studio_generations").update({ status: "failed", error: result.error }).eq("id", id);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const key = `${user.id}/${id}.mp3`;
  await saveFile(key, result.audio);
  await db.from("studio_generations").update({ status: "done", file_key: key, mime_type: result.mime }).eq("id", id);
  return NextResponse.json({ id });
}
