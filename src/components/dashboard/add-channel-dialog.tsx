"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LuPlus, LuLoaderCircle, LuCircleCheck, LuCircleX } from "react-icons/lu";

type QueuedEntry = {
  id: string;
  input: string;
  status: "pending" | "success" | "not_found" | "error";
  name?: string;
  network?: string | null;
};

const checkPrice = Number(process.env.NEXT_PUBLIC_CHECK_PRICE ?? 15);

export function AddChannelDialog({ walletBalance }: { walletBalance: number }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [queue, setQueue] = React.useState<QueuedEntry[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  async function addChannel() {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    if (walletBalance < checkPrice) {
      toast.error(`Insufficient balance. Each check costs $${checkPrice.toFixed(2)}.`);
      return;
    }

    const id = crypto.randomUUID();
    setQueue((q) => [{ id, input: trimmed, status: "pending" }, ...q]);
    setValue("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/mcn/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelInput: trimmed }),
      });
      const data = await res.json();

      if (!res.ok) {
        setQueue((q) => q.filter((e) => e.id !== id));
        toast.error(data.error ?? "Check failed.");
      } else {
        setQueue((q) =>
          q.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: data.check.status,
                  name: data.check.channel_name,
                  network: data.check.network,
                }
              : e
          )
        );
        // let the success state show briefly, then close and go back to the list
        setTimeout(() => onOpenChange(false), 900);
      }
      router.refresh();
    } catch {
      setQueue((q) => q.filter((e) => e.id !== id));
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQueue([]);
      setValue("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button className="gap-1.5">
            <LuPlus className="size-4" />
            Add New
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Add a channel</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChannel();
                  }
                }}
                placeholder="Paste channel link or @handle"
                disabled={submitting}
                className="h-12 text-base"
              />
              <Button
                type="button"
                size="icon-lg"
                onClick={addChannel}
                disabled={submitting || !value.trim()}
                aria-label="Check channel"
              >
                {submitting ? (
                  <LuLoaderCircle className="size-4 animate-spin" />
                ) : (
                  <LuPlus className="size-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ${checkPrice.toFixed(2)} per channel, charged to your wallet
            </p>
          </div>

          {queue.length > 0 ? (
            <div className="flex flex-col gap-2">
              {queue.map((entry) => (
                <ResultRow key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <LuPlus className="size-5" />
              </div>
              <p className="text-sm text-muted-foreground">
                Paste a link above to check your first channel
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResultRow({ entry }: { entry: QueuedEntry }) {
  if (entry.status === "pending") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm">
        <LuLoaderCircle className="size-4 shrink-0 animate-spin text-muted-foreground" />
        <span className="truncate text-muted-foreground">Checking {entry.input}…</span>
      </div>
    );
  }

  if (entry.status === "error") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm">
        <LuCircleX className="size-4 shrink-0 text-destructive" />
        <span className="truncate text-destructive">Couldn&apos;t check {entry.input}</span>
      </div>
    );
  }

  if (entry.status === "not_found") {
    return (
      <div className="flex items-center gap-2.5 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
        <LuCircleCheck className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{entry.input}</span>
        <Badge variant="secondary" className="ml-auto">
          Not found
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-emerald-600/20 bg-emerald-600/5 px-3 py-2.5 text-sm">
      <LuCircleCheck className="size-4 shrink-0 text-emerald-600" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{entry.name || entry.input}</p>
        {entry.network && (
          <p className="truncate text-xs text-muted-foreground">{entry.network}</p>
        )}
      </div>
      <Badge className="shrink-0 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
        -${checkPrice.toFixed(2)}
      </Badge>
    </div>
  );
}
