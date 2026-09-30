import { Suspense } from "react";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { hasHeyGen, listAvatars, listVoices } from "@/lib/studio/heygen";
import { ToolPage } from "@/components/studio/tool-page";
import { WorkspaceSkeleton } from "@/components/studio/workspace-skeleton";
import { AvatarVideoForm } from "./form";

// the avatar and voice lists are cached for hours, and the page shell streams first
async function Loaded() {
  const { user } = await getDashboardSession();
  const supabase = await createClient();
  const [avatars, voices, { data: mine }] = await Promise.all([
    listAvatars(),
    listVoices(),
    supabase.from("studio_avatars").select("id, name").eq("user_id", user!.id).order("created_at", { ascending: false }),
  ]);

  return (
    <AvatarVideoForm
      avatars={[
        ...(mine ?? []).map((m) => ({ id: m.id, name: m.name, image: `/api/studio/files/${m.id}`, mine: true })),
        ...avatars.map((a) => ({ id: a.id, name: a.name, image: a.preview })),
      ]}
      voices={voices.map((v) => ({ id: v.id, name: v.name, meta: [v.language, v.gender].filter(Boolean).join(" · "), preview: v.preview }))}
    />
  );
}

export default function Page() {
  return (
    <ToolPage toolId="avatar-video" notice={!hasHeyGen() ? "HeyGen is not connected yet. Add HEYGEN_API_KEY to the environment and restart." : null}>
      <Suspense fallback={<WorkspaceSkeleton />}>
        <Loaded />
      </Suspense>
    </ToolPage>
  );
}
