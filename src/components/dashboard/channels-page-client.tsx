"use client";

import * as React from "react";
import { useLocalCache } from "@/hooks/use-local-cache";
import { ChannelsBoard } from "@/components/dashboard/channels-board";
import { Skeleton } from "@/components/ui/skeleton";
import type { McnCheck } from "@/lib/types";

type ChannelsResponse = { channels: McnCheck[]; walletBalance: number };

async function fetchChannels(): Promise<ChannelsResponse> {
  const res = await fetch("/api/dashboard/channels", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load channels.");
  return res.json();
}

export function ChannelsPageClient({ initialQuery = "" }: { initialQuery?: string }) {
  const { data, revalidate } = useLocalCache<ChannelsResponse>(
    "dashboard-channels",
    fetchChannels
  );

  if (!data) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Skeleton className="h-11 w-full" />
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ChannelsBoard
      channels={data.channels}
      walletBalance={data.walletBalance}
      initialQuery={initialQuery}
      onDataChange={revalidate}
    />
  );
}
