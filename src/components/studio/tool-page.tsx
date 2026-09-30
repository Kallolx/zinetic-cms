import { Suspense } from "react";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { TOOLS } from "@/lib/studio/tools";
import { enabledEngines, toPublic } from "@/lib/studio/engines";
import { recentGenerations } from "@/lib/studio/queries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { History, ToolHeader, ToolProvider } from "@/components/studio/ui";

// The recent list is the only part that needs the database, so it streams in after
// the page is already on screen instead of holding the whole page back.
async function Recent({ kinds }: { kinds: string[] }) {
  const { user } = await getDashboardSession();
  if (!user) return null;
  return <History rows={await recentGenerations(user.id, kinds)} />;
}

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
  const engines = (await enabledEngines(toolId)).map(toPublic); // cached in memory

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
        {tool.kinds && (
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <Recent kinds={tool.kinds} />
          </Suspense>
        )}
      </div>
    </ToolProvider>
  );
}
