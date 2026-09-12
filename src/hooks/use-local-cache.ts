"use client";

import * as React from "react";

/**
 * Stale-while-revalidate hook backed by localStorage. On mount it shows
 * whatever was cached last (instant, no loading flash), then silently
 * refetches in the background and updates both state and the cache.
 * Call `revalidate()` after a mutation (add/edit/delete) to force a
 * fresh fetch right away instead of waiting for the next natural one.
 */
export function useLocalCache<T>(key: string, fetcher: () => Promise<T>) {
  const storageKey = `zc:${key}`;
  const fetcherRef = React.useRef(fetcher);
  React.useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const [data, setData] = React.useState<T | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    try {
      const raw = window.localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : undefined;
    } catch {
      return undefined;
    }
  });
  const [isValidating, setIsValidating] = React.useState(false);

  const revalidate = React.useCallback(async () => {
    setIsValidating(true);
    try {
      const fresh = await fetcherRef.current();
      setData(fresh);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(fresh));
      } catch {
        // storage full/unavailable — cache is best-effort
      }
    } finally {
      setIsValidating(false);
    }
  }, [storageKey]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount/key-change
    revalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return { data, isLoading: data === undefined && isValidating, isValidating, revalidate, setData };
}
