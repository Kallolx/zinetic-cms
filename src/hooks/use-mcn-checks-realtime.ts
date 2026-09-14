"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { McnCheck } from "@/lib/types";

/**
 * Subscribes to live UPDATE events on mcn_checks via Supabase Realtime, so
 * a channel that finishes processing on the provider's side (updated by
 * the cron job) appears immediately, with no page reload, manual refresh,
 * or polling from the browser. Realtime is scoped by this table's RLS
 * policies same as any other query, so a signed-in user only ever
 * receives their own rows.
 */
export function useMcnChecksRealtime(enabled: boolean, onUpdate: (row: McnCheck) => void) {
  const onUpdateRef = React.useRef(onUpdate);
  React.useEffect(() => {
    onUpdateRef.current = onUpdate;
  });

  React.useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`mcn_checks_${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mcn_checks" },
        (payload) => {
          onUpdateRef.current(payload.new as McnCheck);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);
}
