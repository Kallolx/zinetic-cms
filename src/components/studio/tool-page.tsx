import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { TOOLS } from "@/lib/studio/tools";
import { enabledEngines, toPublic } from "@/lib/studio/engines";
import { recentGenerations } from "@/lib/studio/queries";
import { History, ToolHeader, ToolProvider } from "@/components/studio/ui";

/** Header, the tool itself, and that tool's recent generations. */
export async function ToolPage({
  toolId,
  notice,
  children,
}: {
  toolId: string;
  notice?: string | null;
  children: React.ReactNode;
}) {
  const tool = TOOLS.find((t) => t.id === toolId)!;
  const { user } = await getDashboardSession();
  const engines = (await enabledEngines(toolId)).map(toPublic);
  const rows = tool.kinds && user ? await recentGenerations(user.id, tool.kinds) : [];

  return (
    <ToolProvider toolId={toolId} art={tool.media} engines={engines}>
    <div className="flex flex-col gap-8">
      <ToolHeader />
      {notice && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">{notice}</p>
      )}
      {children}
      <History rows={rows} />
    </div>
    </ToolProvider>
  );
}
