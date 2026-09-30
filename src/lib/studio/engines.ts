import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { CHECK_PRICE } from "@/lib/pricing-plans";
import type { CostUnit } from "@/lib/studio/engine-catalog";

export type Engine = {
  id: string;
  service: string;
  key: string;
  label: string;
  description: string | null;
  provider: string;
  model: string | null;
  credit_cost: number;
  cost_unit: CostUnit;
  enabled: boolean;
  features: string[];
  max_duration_seconds: number | null;
  max_file_mb: number | null;
  max_chars: number | null;
  options: Record<string, unknown>;
  sort: number;
};

/** What the browser is allowed to know about an engine: never the provider or model. */
export type PublicEngine = Pick<
  Engine,
  "key" | "label" | "description" | "credit_cost" | "cost_unit" | "features" | "max_duration_seconds" | "max_file_mb" | "max_chars"
> & { options: Record<string, unknown> };

const cast = (r: Record<string, unknown>): Engine => ({ ...(r as unknown as Engine), credit_cost: Number(r.credit_cost) });

// Engines change rarely and every tool page reads them, so they are cached for a
// minute and cleared right away when an admin saves (see revalidateTag in the admin actions).
export const ENGINES_TAG = "studio-engines";

const loadEngines = unstable_cache(
  async (): Promise<Engine[]> => {
    const { data } = await createAdminClient().from("studio_engines").select("*").order("service").order("sort");
    return (data ?? []).map(cast);
  },
  ["studio-engines"],
  { revalidate: 60, tags: [ENGINES_TAG] }
);

export async function listEngines(service?: string): Promise<Engine[]> {
  const all = await loadEngines();
  return service ? all.filter((e) => e.service === service) : all;
}

export async function enabledEngines(service: string): Promise<Engine[]> {
  return (await listEngines(service)).filter((e) => e.enabled);
}

export const toPublic = (e: Engine): PublicEngine => ({
  key: e.key,
  label: e.label,
  description: e.description,
  credit_cost: e.credit_cost,
  cost_unit: e.cost_unit,
  features: e.features,
  max_duration_seconds: e.max_duration_seconds,
  max_file_mb: e.max_file_mb,
  max_chars: e.max_chars,
  options: e.options,
});

/** The engine a request asked for, or the first enabled one. */
export async function resolveEngine(service: string, key?: string | null): Promise<{ engine: Engine } | { error: string }> {
  const engines = await enabledEngines(service);
  if (engines.length === 0) return { error: "This tool is switched off right now." };
  if (!key) return { engine: engines[0] };
  const found = engines.find((e) => e.key === key);
  return found ? { engine: found } : { error: "That engine is not available." };
}

export type Usage = { chars?: number; seconds?: number; fileMb?: number };

/** Credits this run will cost, rounded up to a thousandth. */
export function costFor(engine: Engine, usage: Usage): number {
  let units = 1;
  if (engine.cost_unit === "minute") units = Math.max(1, Math.ceil((usage.seconds ?? 60) / 60));
  if (engine.cost_unit === "1k_chars") units = Math.max(1, Math.ceil((usage.chars ?? 1000) / 1000));
  return Math.round(engine.credit_cost * units * 1000) / 1000;
}

export function limitError(engine: Engine, usage: Usage): string | null {
  if (engine.max_chars && usage.chars && usage.chars > engine.max_chars) return `This engine accepts up to ${engine.max_chars.toLocaleString()} characters.`;
  if (engine.max_duration_seconds && usage.seconds && usage.seconds > engine.max_duration_seconds) {
    return `This engine accepts media up to ${Math.floor(engine.max_duration_seconds / 60)} minutes.`;
  }
  if (engine.max_file_mb && usage.fileMb && usage.fileMb > engine.max_file_mb) return `This engine accepts files up to ${engine.max_file_mb} MB.`;
  return null;
}

const usdOf = (credits: number) => Math.round(credits * CHECK_PRICE * 100) / 100;

/** Debits the wallet atomically. Returns the new balance in USD, or null if it cannot cover it. */
export async function charge(userId: string, credits: number, note: string): Promise<{ ok: true; balance: number } | { ok: false }> {
  if (credits <= 0) return { ok: true, balance: NaN };
  const { data, error } = await createAdminClient().rpc("studio_charge", { p_user: userId, p_usd: usdOf(credits), p_note: note });
  if (error || data === null || data === undefined) return { ok: false };
  return { ok: true, balance: Number(data) };
}

export async function refund(userId: string, credits: number, note: string) {
  if (credits <= 0) return;
  await createAdminClient().rpc("studio_refund", { p_user: userId, p_usd: usdOf(credits), p_note: note });
}
