import { CHECK_PRICE } from "@/lib/pricing-plans";

/**
 * The wallet ledger (profiles.wallet_balance, wallet_transactions.amount,
 * mcn_checks.cost, payment_sessions.usd_amount) still stores raw USD
 * internally, unchanged, so no migration touches real financial history.
 * 1 Credit = $CHECK_PRICE always, everything user- or admin-facing
 * converts to Credits only at display time.
 */
export function usdToCredits(usd: number): number {
  return Math.round((usd / CHECK_PRICE) * 100) / 100;
}

export function creditsToUsd(credits: number): number {
  return Math.round(credits * CHECK_PRICE * 100) / 100;
}

/** "1 Credit", "2.5 Credits", "0.67 Credits" */
export function formatCredits(usd: number): string {
  const credits = usdToCredits(usd);
  const label = Number.isInteger(credits) ? String(credits) : credits.toFixed(2);
  return `${label} Credit${credits === 1 ? "" : "s"}`;
}

/** "+1 Credit", "-2.5 Credits", for transaction/ledger rows */
export function formatSignedCredits(usd: number): string {
  const credits = usdToCredits(usd);
  const sign = credits >= 0 ? "+" : "";
  const label = Number.isInteger(credits) ? String(credits) : credits.toFixed(2);
  return `${sign}${label} Credit${Math.abs(credits) === 1 ? "" : "s"}`;
}
