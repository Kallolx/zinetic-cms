import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";
import { TOOLS } from "@/lib/studio/tools";

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

const LABEL: Record<string, string> = {
  voice: "Voice generator",
  sfx: "Sound effects",
  transcribe: "Speech to text",
  "prompt-video": "Prompt to video",
  "translation-lipsync": "Video translation",
};
const labelFor = (kind: string) => LABEL[kind] ?? TOOLS.find((t) => t.id === kind)?.name ?? kind;

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
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Library</h2>
        <p className="text-[0.925rem] text-muted-foreground">Everything you have generated, newest first.</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet. Generate something and it will appear here.</p>
      ) : (
        <ul className="divide-y border-y">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="line-clamp-1 font-medium">{r.title ?? "Untitled"}</span>
                <span className="text-xs text-muted-foreground">
                  {labelFor(r.kind)} · {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              {r.status === "done" && r.mime_type?.startsWith("audio") && (
                <audio controls preload="none" src={`/api/studio/files/${r.id}`} className="w-full max-w-xl" />
              )}
              {r.status === "done" && r.mime_type?.startsWith("video") && (
                <video controls preload="none" src={`/api/studio/files/${r.id}`} className="max-h-64 w-fit rounded-lg bg-black" />
              )}
              {r.status === "done" && r.kind === "transcribe" && r.result?.text && (
                <p className="line-clamp-3 max-w-2xl text-sm text-muted-foreground">{r.result.text}</p>
              )}
              {r.status === "failed" && <p className="text-xs text-destructive">{r.error ?? "Failed"}</p>}
              {r.status === "processing" && <p className="text-xs text-muted-foreground">Still processing</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
