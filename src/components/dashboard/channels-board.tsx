"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LuSearch, LuDownload, LuLoaderCircle } from "react-icons/lu";
import { AddChannelDialog } from "@/components/dashboard/add-channel-dialog";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import type { McnCheck } from "@/lib/types";
import { isChannelStillProcessing } from "@/lib/mcn-provider";

const PAGE_SIZE = 15;

function StatusDot({ status }: { status: McnCheck["status"] }) {
  const label =
    status === "success" ? "Succeeded" : status === "not_found" ? "Not found" : "Failed";
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

const isPending = isChannelStillProcessing;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function toCsv(rows: McnCheck[]) {
  const header = ["Channel", "Channel ID", "Network", "Contact Email", "Status", "Updated"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = rows.map((c) =>
    [
      c.channel_name ?? c.channel_input,
      c.channel_id ?? "",
      c.network ?? "",
      c.network_contact_email ?? "",
      c.status,
      new Date(c.created_at).toLocaleDateString(),
    ]
      .map((v) => escape(String(v)))
      .join(",")
  );
  return [header.map(escape).join(","), ...lines].join("\n");
}

export function ChannelsBoard({
  channels,
  walletBalance,
  initialQuery = "",
  onDataChange,
}: {
  channels: McnCheck[];
  walletBalance: number;
  initialQuery?: string;
  onDataChange?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [lastInitialQuery, setLastInitialQuery] = React.useState(initialQuery);

  // adjust state during render when the URL's ?q= changes, per React's
  // guidance for syncing state to a prop without an effect
  if (initialQuery !== lastInitialQuery) {
    setLastInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  const filtered = channels.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.channel_name?.toLowerCase().includes(q) ||
      c.channel_input.toLowerCase().includes(q) ||
      c.network?.toLowerCase().includes(q)
    );
  });

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
      toast.error("No channels to export.");
      return;
    }
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "channels.csv";
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
            placeholder="Looking for a channel..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          )}
          <Button variant="outline" className="gap-1.5" onClick={exportCsv}>
            <LuDownload className="size-4" />
            Export Excel
          </Button>
          <AddChannelDialog walletBalance={walletBalance} onSuccess={onDataChange} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border py-16 text-center text-sm text-muted-foreground">
          {channels.length === 0
            ? "No channels yet. Click \"Add New\" to check your first one."
            : "No channels match your search."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Contact email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((c) => {
                const pending = isPending(c);
                return (
                <TableRow
                  key={c.id}
                  className={pending ? "opacity-80" : "group cursor-pointer"}
                  data-state={selected.has(c.id) ? "selected" : undefined}
                  onClick={() => {
                    if (pending) {
                      toast.info("Still processing. This will unlock automatically once the network data is ready.");
                      return;
                    }
                    router.push(`/dashboard/channel/${c.id}`);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(c.id)}
                      onCheckedChange={() => toggleOne(c.id)}
                      aria-label={`Select ${c.channel_name ?? c.channel_input}`}
                    />
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
                        <p className={pending ? "truncate font-medium" : "truncate font-medium group-hover:underline"}>
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
                  <TableCell>
                    {pending ? <Skeleton className="h-4 w-20" /> : (c.network ?? "N/A")}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {pending ? <Skeleton className="h-4 w-32" /> : (c.network_contact_email ?? "N/A")}
                  </TableCell>
                  <TableCell>
                    {pending ? (
                      <Badge variant="secondary" className="gap-1.5">
                        <LuLoaderCircle className="size-3 animate-spin" />
                        Processing
                      </Badge>
                    ) : (
                      <StatusDot status={c.status} />
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
