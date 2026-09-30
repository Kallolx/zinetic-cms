import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = {
  id: string;
  kind: string;
  provider: string;
  engine_key: string | null;
  credits: number;
  status: string;
  input: { text?: string };
  error: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string } | null;
};

export default async function AdminStudioPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_generations")
    .select("id, kind, provider, engine_key, credits, status, input, error, created_at, profiles:user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Studio usage</CardTitle>
        <CardDescription>Every AI Studio generation across all customers.</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No generations yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>When</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tool</TableHead>
                <TableHead>Engine</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead>Input</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{r.profiles?.full_name || r.profiles?.email}</TableCell>
                  <TableCell>{r.kind}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.engine_key ?? "-"} ({r.provider})
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{Number(r.credits) || ""}</TableCell>
                  <TableCell className="max-w-xs truncate">{r.input.text ?? ""}</TableCell>
                  <TableCell className={r.status === "failed" ? "text-destructive" : ""}>
                    {r.status === "failed" ? (r.error ?? "failed") : r.status}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
