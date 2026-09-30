import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createClient } from "@/lib/supabase/server";

type Row = {
  id: string;
  kind: string;
  status: string;
  input: { text?: string };
  mime_type: string | null;
  error: string | null;
  created_at: string;
};

export default async function LibraryPage() {
  const { user } = await getDashboardSession();
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_generations")
    .select("id, kind, status, input, mime_type, error, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = (data ?? []) as Row[];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Library</h2>
        <p className="text-[0.925rem] text-muted-foreground">Everything you have generated.</p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing yet. Generate something and it will appear here.</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="line-clamp-1 font-medium">{r.input.text ?? r.kind}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </span>
              </div>
              {r.status === "done" && r.mime_type?.startsWith("audio") && (
                <audio controls preload="none" src={`/api/studio/files/${r.id}`} className="w-full" />
              )}
              {r.status === "failed" && <p className="text-xs text-destructive">{r.error ?? "Failed"}</p>}
              {r.status === "processing" && <p className="text-xs text-muted-foreground">Processing</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
