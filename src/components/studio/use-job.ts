"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export type JobState<T = unknown> =
  | { phase: "idle" }
  | { phase: "working"; message?: string }
  | { phase: "done"; id: string; data?: T }
  | { phase: "error"; error: string };

const POLL_MS = 5000;
const GIVE_UP_MS = 45 * 60 * 1000;

/**
 * Runs one generation. `async` tools (video, dubbing) answer immediately with a
 * processing row, which is then polled until the provider has finished.
 */
export function useJob<T = unknown>() {
  const router = useRouter();
  const [state, setState] = React.useState<JobState<T>>({ phase: "idle" });
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = React.useCallback(
    async (request: () => Promise<Response>, opts: { async?: boolean; message?: string } = {}) => {
      setState({ phase: "working", message: opts.message });
      try {
        const res = await request();
        const json = (await res.json().catch(() => ({}))) as { id?: string; error?: string } & T;
        if (!res.ok || !json.id) {
          setState({ phase: "error", error: json.error ?? "Something went wrong." });
          return;
        }
        if (!opts.async) {
          setState({ phase: "done", id: json.id, data: json });
          router.refresh();
          return;
        }
        const started = Date.now();
        while (alive.current && Date.now() - started < GIVE_UP_MS) {
          await new Promise((r) => setTimeout(r, POLL_MS));
          const poll = await fetch(`/api/studio/jobs/${json.id}`, { cache: "no-store" });
          const s = (await poll.json().catch(() => ({}))) as { status?: string; error?: string };
          if (s.status === "done") {
            if (alive.current) setState({ phase: "done", id: json.id });
            router.refresh();
            return;
          }
          if (s.status === "failed") {
            if (alive.current) setState({ phase: "error", error: s.error ?? "The provider could not finish this." });
            router.refresh();
            return;
          }
        }
        if (alive.current) setState({ phase: "error", error: "This is taking longer than expected. Check the Library later." });
      } catch {
        setState({ phase: "error", error: "Could not reach the server." });
      }
    },
    [router]
  );

  const reset = React.useCallback(() => setState({ phase: "idle" }), []);
  return { state, run, reset };
}
