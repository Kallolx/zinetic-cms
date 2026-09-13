"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LuMail, LuRefreshCw } from "react-icons/lu";

type NetworkState = {
  network: string | null;
  network_contact_email: string | null;
  isConfirmedFinal: boolean;
};

type ChannelNetworkContextValue = NetworkState & {
  isPolling: boolean;
  isTimedOut: boolean;
  isRefreshing: boolean;
  manualRefresh: () => void;
};

const ChannelNetworkContext = React.createContext<ChannelNetworkContextValue | null>(null);

function useChannelNetwork() {
  const ctx = React.useContext(ChannelNetworkContext);
  if (!ctx) throw new Error("useChannelNetwork must be used within ChannelNetworkProvider");
  return ctx;
}

const POLL_INTERVAL_MS = 15_000;
const MAX_POLL_ATTEMPTS = 8; // ~2 minutes of silent background polling

export function ChannelNetworkProvider({
  checkId,
  initialNetwork,
  initialContactEmail,
  initialIsConfirmedFinal,
  children,
}: {
  checkId: string;
  initialNetwork: string | null;
  initialContactEmail: string | null;
  initialIsConfirmedFinal: boolean;
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<NetworkState>({
    network: initialNetwork,
    network_contact_email: initialContactEmail,
    isConfirmedFinal: initialIsConfirmedFinal,
  });
  const [isPolling, setIsPolling] = React.useState(
    !initialNetwork && !initialIsConfirmedFinal
  );
  const [isTimedOut, setIsTimedOut] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const runRefresh = React.useCallback(async (): Promise<NetworkState | null> => {
    try {
      const res = await fetch("/api/mcn/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkId }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      const check = data.check;
      if (!check) return null;
      const rawStatus = (check.raw_response as Record<string, unknown> | null)?.status;
      return {
        network: check.network,
        network_contact_email: check.network_contact_email,
        isConfirmedFinal: rawStatus === "updated",
      };
    } catch {
      return null;
    }
  }, [checkId]);

  React.useEffect(() => {
    if (!isPolling) return;

    let cancelled = false;
    let attempts = 0;

    const tick = async () => {
      attempts += 1;
      const next = await runRefresh();
      if (cancelled) return;

      if (next && (next.network || next.isConfirmedFinal)) {
        setState(next);
        setIsPolling(false);
        return;
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        setIsPolling(false);
        setIsTimedOut(true);
        return;
      }
    };

    const interval = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isPolling, runRefresh]);

  const manualRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    runRefresh()
      .then((next) => {
        if (!next) {
          toast.error("Couldn't refresh this channel right now.");
          return;
        }
        setState(next);
        if (next.network) {
          toast.success("Network data found and updated.");
          setIsPolling(false);
          setIsTimedOut(false);
        } else if (next.isConfirmedFinal) {
          toast.info("Confirmed: this channel has no MCN network on file.");
          setIsPolling(false);
          setIsTimedOut(false);
        } else {
          toast.info("Still no network data yet. Trying again in the background.");
          setIsTimedOut(false);
          setIsPolling(true);
        }
      })
      .finally(() => setIsRefreshing(false));
  }, [runRefresh]);

  const value: ChannelNetworkContextValue = {
    ...state,
    isPolling,
    isTimedOut,
    isRefreshing,
    manualRefresh,
  };

  return (
    <ChannelNetworkContext.Provider value={value}>{children}</ChannelNetworkContext.Provider>
  );
}

export function OwnerContactCardBody() {
  const { network, network_contact_email, isConfirmedFinal, isPolling, isTimedOut, isRefreshing, manualRefresh } =
    useChannelNetwork();

  if (isPolling) {
    return (
      <div className="flex flex-col gap-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Network</p>
          <Skeleton className="mt-1 h-4 w-24" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Contact email</p>
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
        <p className="text-xs text-muted-foreground">
          Checking for network data in the background. This can take a few minutes for newly
          added channels.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <div>
        <p className="text-xs text-muted-foreground">Network</p>
        <p className="font-medium">{network ?? (isConfirmedFinal ? "Independent" : "Pending")}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Contact email</p>
        {network_contact_email ? (
          <a
            href={`mailto:${network_contact_email}`}
            className="font-medium text-primary underline underline-offset-4"
          >
            {network_contact_email}
          </a>
        ) : (
          <p className="font-medium text-muted-foreground">Not available</p>
        )}
      </div>
      {!network && (
        <p className="text-xs text-muted-foreground">
          {isConfirmedFinal
            ? "Confirmed: this channel has no MCN network on file."
            : "We couldn't find network data yet."}{" "}
          {!isConfirmedFinal && (
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 text-xs"
              disabled={isRefreshing}
              onClick={manualRefresh}
            >
              <LuRefreshCw className={isRefreshing ? "size-3 animate-spin" : "size-3"} />
              {isTimedOut ? "Check again" : "Refresh now"}
            </Button>
          )}
        </p>
      )}
    </div>
  );
}

export function CopyrightOwnershipBody() {
  const { network, network_contact_email, isConfirmedFinal, isPolling, isTimedOut, isRefreshing, manualRefresh } =
    useChannelNetwork();

  if (isPolling) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Content owner</p>
          <Skeleton className="mt-2 h-5 w-32" />
        </div>
        <div className="rounded-lg border p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LuMail className="size-3.5" /> Contact email
          </p>
          <Skeleton className="mt-2 h-5 w-40" />
        </div>
      </div>
    );
  }

  if (network || network_contact_email) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Content owner</p>
          <p className="mt-1 font-medium">{network}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <LuMail className="size-3.5" /> Contact email
          </p>
          <p className="mt-1 font-medium">{network_contact_email ?? "Not available"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-8 text-center text-sm text-muted-foreground">
      <p>No network or ownership data found for this channel.</p>
      {isConfirmedFinal ? (
        <p className="text-xs">Confirmed: this channel has no MCN network on file.</p>
      ) : (
        <Button
          size="sm"
          variant="link"
          className="h-auto p-0 text-xs"
          disabled={isRefreshing}
          onClick={manualRefresh}
        >
          <LuRefreshCw className={isRefreshing ? "size-3 animate-spin" : "size-3"} />
          {isTimedOut ? "Check again" : "Refresh now"}
        </Button>
      )}
    </div>
  );
}
