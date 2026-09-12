"use client";

/**
 * The header/sidebar wallet balance comes from the dashboard layout, a
 * Server Component that does not re-render on client-side navigation.
 * A check charges the wallet via a plain fetch from deep inside the page
 * tree, so it has to reach the layout's display some other way, hence
 * this tiny pub-sub instead of a prop or a route refresh (which would
 * bring back the full-page loading skeleton this app deliberately avoids).
 */
type Listener = (balance: number) => void;
const listeners = new Set<Listener>();

export function emitWalletBalance(balance: number) {
  listeners.forEach((listener) => listener(balance));
}

export function onWalletBalance(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
