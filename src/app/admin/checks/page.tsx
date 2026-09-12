import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LuCircleCheck, LuCircleX, LuCircleAlert } from "react-icons/lu";

function StatusBadge({ status }: { status: string }) {
  if (status === "success")
    return (
      <Badge className="gap-1 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
        <LuCircleCheck className="size-3.5" /> Success
      </Badge>
    );
  if (status === "not_found")
    return (
      <Badge variant="secondary" className="gap-1">
        <LuCircleAlert className="size-3.5" /> Not found
      </Badge>
    );
  return (
    <Badge variant="destructive" className="gap-1">
      <LuCircleX className="size-3.5" /> Error
    </Badge>
  );
}

export default async function AdminChecksPage() {
  const supabase = await createClient();
  const { data: checks } = await supabase
    .from("mcn_checks")
    .select("*, profiles:user_id(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>All checks</CardTitle>
          <CardDescription>Every MCN check run across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          {!checks || checks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No checks yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {checks.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {c.profiles?.full_name ?? c.profiles?.email ?? "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {c.channel_name ?? c.channel_input}
                      </TableCell>
                      <TableCell>{c.network ?? "N/A"}</TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="text-right">${Number(c.cost).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
