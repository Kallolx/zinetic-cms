import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { TOOLS } from "@/lib/studio/tools";
import { enabledEngines, toPublic } from "@/lib/studio/engines";
import { recentGenerations } from "@/lib/studio/queries";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [engineList, rows] = await Promise.all([
    enabledEngines(toolId),
    tool.kinds && user ? recentGenerations(user.id, tool.kinds) : Promise.resolve([]),
  ]);
  const engines = engineList.map(toPublic);

  return (
    <ToolProvider toolId={toolId} engines={engines}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <ToolHeader />
        {notice && (
          <Alert>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}
        {children}
        <History rows={rows} />
      </div>
    </ToolProvider>
  );
}
