import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAvatarVideo, generatePhotoVideo } from "@/lib/studio/heygen";
import { begin, fail, requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;

  const b = (await request.json().catch(() => null)) as {
    avatarId?: string;
    myAvatarId?: string;
    voiceId?: string;
    script?: string;
    ratio?: "16:9" | "9:16" | "1:1";
  } | null;
  const script = b?.script?.trim() ?? "";
  if (!script || !b?.voiceId || (!b.avatarId && !b.myAvatarId)) return fail("Choose an avatar, a voice and write a script.");
  if (script.length > 4000) return fail("Keep the script under 4,000 characters.");

  let job;
  if (b.myAvatarId) {
    const { data } = await createAdminClient()
      .from("studio_avatars")
      .select("image_key")
      .eq("id", b.myAvatarId)
      .eq("user_id", auth.userId)
      .single();
    if (!data) return fail("That avatar was not found.", 404);
    job = await generatePhotoVideo({ imageKey: data.image_key, voiceId: b.voiceId, script });
  } else {
    job = await generateAvatarVideo({ avatarId: b.avatarId!, voiceId: b.voiceId, script, ratio: b.ratio ?? "16:9" });
  }
  if (!job.ok) return fail(job.error, 502);

  const g = await begin(auth.userId, "avatar-video", "heygen", script.slice(0, 80), { ...b, script }, job.videoId);
  return NextResponse.json({ id: g.id });
}
