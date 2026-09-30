import { NextResponse } from "next/server";
import { listAvatars, listTranslateLanguages, listVoices } from "@/lib/studio/heygen";
import { requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;
  const type = new URL(request.url).searchParams.get("type");
  if (type === "avatars") return NextResponse.json({ items: await listAvatars() });
  if (type === "voices") return NextResponse.json({ items: await listVoices() });
  if (type === "languages") return NextResponse.json({ items: await listTranslateLanguages() });
  return NextResponse.json({ error: "Unknown catalog" }, { status: 400 });
}
