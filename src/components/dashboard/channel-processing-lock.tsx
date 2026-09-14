"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMcnChecksRealtime } from "@/hooks/use-mcn-checks-realtime";
import { LuLoaderCircle, LuArrowLeft } from "react-icons/lu";

/**
 * Shown instead of the channel detail page while the provider is still
 * processing it. Subscribes to Realtime and refreshes itself the instant
 * this row's data lands, no manual action or repeated page visits needed.
 */
export function ChannelProcessingLock({
  checkId,
  channelName,
}: {
  checkId: string;
  channelName: string;
}) {
  const router = useRouter();

  useMcnChecksRealtime(true, (updated) => {
    if (updated.id === checkId && updated.provider_status === "updated") {
      router.refresh();
    }
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border py-24 text-center">
      <LuLoaderCircle className="size-8 animate-spin text-muted-foreground" />
      <div>
        <p className="font-medium">Still processing {channelName}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          We&apos;re waiting on network ownership data from the provider. This page unlocks
          automatically the moment it&apos;s ready, no need to refresh or come back later.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-primary underline underline-offset-4"
      >
        <LuArrowLeft className="size-4" />
        Back to Copyright
      </Link>
    </div>
  );
}
