"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LuRefreshCw } from "react-icons/lu";

export function RefreshChannelButton({ checkId }: { checkId: string }) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/mcn/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't refresh this channel.");
        return;
      }
      if (data.check?.network) {
        toast.success("Network data found and updated.");
      } else {
        toast.info("Still no network data yet. Try again in a few minutes.");
      }
      router.refresh();
    } catch {
      toast.error("Couldn't refresh this channel.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="gap-1.5"
      disabled={isRefreshing}
      onClick={handleRefresh}
    >
      <LuRefreshCw className={isRefreshing ? "size-3.5 animate-spin" : "size-3.5"} />
      {isRefreshing ? "Refreshing..." : "Refresh"}
    </Button>
  );
}
