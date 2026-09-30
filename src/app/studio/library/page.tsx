import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { TOOLS } from "@/lib/studio/tools";
import { AudioPlayer, WaveArt } from "@/components/studio/audio-player";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  kind: string;
  title: string | null;
  status: string;
  mime_type: string | null;
  result: { text?: string } | null;
  error: string | null;
  created_at: string;
};

const KIND_TOOL: Record<string, string> = {
  sfx: "sound-effects",
  "translation-lipsync": "video-translation",
  "audio-cleaner": "audio-cleaner",
};
const toolFor = (kind: string) => TOOLS.find((t) => t.id === (KIND_TOOL[kind] ?? kind)) ?? TOOLS[0];

export default async function LibraryPage() {
  const { user } = await getDashboardSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_generations")
    .select("id, kind, title, status, mime_type, result, error, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as Row[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-4xl font-bold">Library</h1>
        <p className="mt-1 text-white/60">Everything you have generated, newest first.</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-2 rounded-3xl bg-white/[0.03] text-center ring-1 ring-white/10">
          <div className="h-12 w-48 opacity-60">
            <WaveArt animate={false} />
          </div>
          <p className="font-medium">Nothing here yet</p>
          <p className="text-sm text-white/55">Make something in any tool and it will land here.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const tool = toolFor(r.kind);
            const Icon = tool.icon;
            return (
              <li key={r.id} className="overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/10">
                {r.status === "done" && r.mime_type?.startsWith("video") ? (
                  <video controls preload="metadata" src={`/api/studio/files/${r.id}`} className="aspect-video w-full bg-black" />
                ) : (
                  <div className={cn("flex h-20 items-center gap-3 bg-gradient-to-br px-4", tool.accent)}>
                    <Icon className="size-6 shrink-0" />
                    <span className="text-sm font-semibold">{tool.name}</span>
                  </div>
                )}
                <div className="flex flex-col gap-3 p-4">
                  <p className="line-clamp-1 font-medium">{r.title ?? "Untitled"}</p>
                  {r.status === "done" && r.mime_type?.startsWith("audio") && (
                    <AudioPlayer compact src={`/api/studio/files/${r.id}`} seed={r.id} name="audio.mp3" />
                  )}
                  {r.status === "done" && r.kind === "transcribe" && r.result?.text && (
                    <p className="line-clamp-4 text-sm text-white/60">{r.result.text}</p>
                  )}
                  {r.status === "failed" && <p className="text-xs text-red-300">{r.error ?? "Failed"}</p>}
                  {r.status === "processing" && <p className="text-xs text-white/55">Still processing</p>}
                  <p className="text-xs text-white/40">{new Date(r.created_at).toLocaleString()}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
