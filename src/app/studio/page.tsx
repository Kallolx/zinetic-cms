import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { GROUPS, TOOLS } from "@/lib/studio/tools";
import { HomeHero } from "@/components/studio/home-hero";
import { ToolCard } from "@/components/studio/media";
import { AudioPlayer } from "@/components/studio/audio-player";

type Row = { id: string; kind: string; title: string | null; status: string; mime_type: string | null };

export default async function StudioHome() {
  const { user, profile } = await getDashboardSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_generations")
    .select("id, kind, title, status, mime_type")
    .eq("user_id", user!.id)
    .eq("status", "done")
    .order("created_at", { ascending: false })
    .limit(4);
  const recent = (data ?? []) as Row[];

  return (
    <div className="flex flex-col gap-12">
      <HomeHero name={profile?.full_name ?? ""} />

      {recent.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-heading text-2xl font-semibold">Pick up where you left off</h2>
            <Link href="/studio/library" className="flex items-center gap-1 text-sm text-white/60 hover:text-white">
              Library <LuArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recent.map((r) => (
              <li key={r.id}>
                {r.mime_type?.startsWith("video") ? (
                  <video controls preload="metadata" src={`/api/studio/files/${r.id}`} className="aspect-video w-full rounded-2xl bg-black ring-1 ring-white/10" />
                ) : r.mime_type?.startsWith("audio") ? (
                  <AudioPlayer compact src={`/api/studio/files/${r.id}`} seed={r.id} name="audio.mp3" title={r.title ?? undefined} />
                ) : (
                  <Link href="/studio/library" className="block rounded-2xl bg-white/[0.04] p-4 text-sm ring-1 ring-white/10">
                    {r.title ?? r.kind}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {GROUPS.map((g) => (
        <section key={g.id} className="flex flex-col gap-5">
          <div>
            <h2 className="font-heading text-2xl font-semibold">{g.label}</h2>
            <p className="mt-1 text-sm text-white/55">{g.blurb}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {TOOLS.filter((t) => t.group === g.id).map((t) => (
              <ToolCard key={t.id} toolId={t.id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
