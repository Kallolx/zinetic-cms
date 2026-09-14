"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ViewRawDialog } from "@/components/admin/view-raw-dialog";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { LuSearch, LuDownload } from "react-icons/lu";
import { usdToCredits, formatCredits } from "@/lib/credits";

const PAGE_SIZE = 15;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toCsv(rows: any[]) {
  const header = [
    "User",
    "Channel",
    "Channel ID",
    "Network",
    "Contact Email",
    "Status",
    "Cost (Credits)",
    "Date",
  ];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((c) =>
    [
      c.profiles?.full_name ?? c.profiles?.email ?? "",
      c.channel_name ?? c.channel_input,
      c.channel_id ?? "",
      c.network ?? "",
      c.network_contact_email ?? "",
      c.status,
      usdToCredits(Number(c.cost)),
      new Date(c.created_at).toLocaleDateString(),
    ]
      .map((v) => escape(String(v)))
      .join(",")
  );
  return [header.map(escape).join(","), ...lines].join("\n");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ChecksTable({ checks }: { checks: any[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    if (!query.trim()) return checks;
    const q = query.toLowerCase();
    return checks.filter(
      (c) =>
        c.channel_name?.toLowerCase().includes(q) ||
        c.channel_input?.toLowerCase().includes(q) ||
        c.network?.toLowerCase().includes(q) ||
        c.profiles?.full_name?.toLowerCase().includes(q) ||
        c.profiles?.email?.toLowerCase().includes(q)
    );
  }, [checks, query]);

  const { page, setPage, pageCount, pageItems } = usePagination(filtered, PAGE_SIZE);

  const allSelected = filtered.length > 0 && filtered.every((c) => selected.has(c.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((c) => c.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exportCsv() {
    const rows = selected.size > 0 ? filtered.filter((c) => selected.has(c.id)) : filtered;
    if (rows.length === 0) {
      toast.error("No checks to export.");
      return;
    }
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "checks.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <LuSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by channel, network, or user..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          )}
          <Button variant="outline" className="gap-1.5" onClick={exportCsv}>
            <LuDownload className="size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No checks match.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                </TableHead>
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
              {pageItems.map((c) => (
                <TableRow
                  key={c.id}
                  className="group cursor-pointer"
                  data-state={selected.has(c.id) ? "selected" : undefined}
                  onClick={() => router.push(`/admin/checks/${c.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggleOne(c.id)}
                      aria-label={`Select ${c.channel_name ?? c.channel_input}`}
                    />
                  </TableCell>
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
                        <p className="truncate font-medium group-hover:underline">
                          {c.channel_name ?? c.channel_input}
                        </p>
                        {c.channel_id && (
                          <p className="truncate text-xs text-muted-foreground">{c.channel_id}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.status === "success" && c.provider_status === "pending"
                      ? "Processing..."
                      : (c.network ?? "N/A")}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {c.status === "success" && c.provider_status === "pending"
                      ? "Processing..."
                      : (c.network_contact_email ?? "N/A")}
                  </TableCell>
                  <TableCell>
                    <StatusDot status={c.status} />
                  </TableCell>
                  <TableCell className="text-right">{formatCredits(Number(c.cost))}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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

      <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
