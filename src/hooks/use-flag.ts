"use client";

import * as React from "react";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

export const readFlag = (key: string) => {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

/** A true/false choice remembered in this browser, such as a collapsed sidebar. */
export function useFlag(key: string) {
  const value = React.useSyncExternalStore(subscribe, () => readFlag(key), () => false);
  const set = React.useCallback(
    (next: boolean) => {
      try {
        localStorage.setItem(key, next ? "1" : "0");
      } catch {}
      listeners.forEach((l) => l());
    },
    [key]
  );
  return [value, set] as const;
}
