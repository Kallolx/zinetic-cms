export type Currency = "USD" | "BDT";

export const USD_TO_BDT_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT_RATE ?? 122);

export function formatUsd(usd: number) {
  return `$${usd % 1 === 0 ? usd.toFixed(0) : usd.toFixed(2)}`;
}

export function formatBdt(usd: number) {
  return `৳${Math.round(usd * USD_TO_BDT_RATE).toLocaleString("en-US")}`;
}

export function formatMoney(usd: number, currency: Currency) {
  return currency === "USD" ? formatUsd(usd) : formatBdt(usd);
}

export function periodSuffix(period: "year" | "month" | "avatar" | null | undefined) {
  if (period === "year") return "/year";
  if (period === "month") return "/month";
  if (period === "avatar") return "/avatar";
  return "";
}
