import Image from "next/image";
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
import { ViewRawDialog } from "@/components/admin/view-raw-dialog";

function StatusDot({ status }: { status: string }) {
  const label = status === "success" ? "Succeeded" : status === "not_found" ? "Not found" : "Failed";
  const color =
    status === "success"
      ? "bg-emerald-500"
      : status === "not_found"
        ? "bg-muted-foreground"
        : "bg-destructive";

  return (
    <Badge variant="secondary" className="gap-1.5">
      <span className={`size-1.5 rounded-full ${color}`} />
      {label}
    </Badge>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
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
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Contact email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {checks.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="max-w-[160px] truncate text-muted-foreground">
                        {c.profiles?.full_name ?? c.profiles?.email ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {c.avatar_url ? (
                            <Image
                              src={c.avatar_url}
                              alt={c.channel_name ?? ""}
                              width={36}
                              height={36}
                              unoptimized
                              className="size-9 shrink-0 rounded-full border object-cover"
                            />
                          ) : (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {initials(c.channel_name ?? c.channel_input)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {c.channel_name ?? c.channel_input}
                            </p>
                            {c.channel_id && (
                              <p className="truncate text-xs text-muted-foreground">
                                {c.channel_id}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{c.network ?? "N/A"}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {c.network_contact_email ?? "N/A"}
                      </TableCell>
                      <TableCell>
                        <StatusDot status={c.status} />
                      </TableCell>
                      <TableCell className="text-right">${Number(c.cost).toFixed(2)}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <ViewRawDialog
                          channelName={c.channel_name ?? ""}
                          channelInput={c.channel_input}
                          rawResponse={c.raw_response}
                        />
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
