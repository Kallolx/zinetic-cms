import { listEngines } from "@/lib/studio/engines";
import { TOOLS } from "@/lib/studio/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EnginesManager } from "@/components/admin/engines-manager";

export default async function AdminEnginesPage() {
  const engines = await listEngines();
  // lip sync has no provider yet, so it has no service to configure
  const services = TOOLS.filter((t) => !t.soon).map((t) => ({
    id: t.id,
    name: t.name,
    engines: engines.filter((e) => e.service === t.id),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Engines</h1>
        <p className="mt-1 text-sm text-muted-foreground">The providers behind each AI Studio tool, and how much of a plan an engine uses.</p>
      </div>
    <Card>
      <CardHeader>
        <CardTitle>Engines and pricing</CardTitle>
        <CardDescription>
          Each AI Studio tool can have several engines. Customers pick one on the tool page, and each engine has its own provider,
          model, credit cost and limits. A service with more than one enabled engine shows a chooser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EnginesManager services={services} />
      </CardContent>
    </Card>
    </div>
  );
}
