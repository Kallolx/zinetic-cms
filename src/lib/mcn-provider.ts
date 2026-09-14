const NO_VALUE_SENTINELS = new Set(["no network", "no email", "n/a", "none"]);

/**
 * The provider uses "No Network"/"No Email" as their own sentinel for
 * "none", not a real value, so normalize those (and other placeholders)
 * to null.
 */
export function normalizeSentinel(value: string | null | undefined): string | null {
  if (!value) return null;
  return NO_VALUE_SENTINELS.has(value.trim().toLowerCase()) ? null : value;
}

export type ProviderChannel = {
  status?: string;
  channel_id?: string;
  channel_name?: string;
  network_name?: string;
  email_cms?: string;
  subscriber_count?: number;
  total_views?: number;
  video_count?: number;
  avatar?: string;
  [key: string]: unknown;
};

export type ProviderFetchResult =
  | { outcome: "ok"; result: ProviderChannel }
  | { outcome: "not_found" }
  | { outcome: "error" };

/**
 * GETs a single channel's current data from the real MCN provider. Used
 * both by the initial check (after registering a new channel) and by the
 * background cron job re-polling channels still marked "pending".
 */
export async function fetchProviderChannel(channelId: string): Promise<ProviderFetchResult> {
  const apiBase = process.env.MCN_API_BASE_URL ?? "https://api.amnhacso.com";
  const apiKey = process.env.MCN_API_KEY;
  if (!apiKey) return { outcome: "error" };

  try {
    const res = await fetch(`${apiBase}/api/v1/channels/${encodeURIComponent(channelId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (res.status === 404) return { outcome: "not_found" };
    if (!res.ok) return { outcome: "error" };
    const result = (await res.json()) as ProviderChannel;
    return { outcome: "ok", result };
  } catch {
    return { outcome: "error" };
  }
}

/**
 * Maps a raw provider response onto the mcn_checks columns we store,
 * including provider_status, the field the cron job and UI use to know
 * whether this channel is still being processed.
 */
export function mapProviderResult(result: ProviderChannel) {
  return {
    channel_name: result.channel_name ?? null,
    network: normalizeSentinel(result.network_name),
    network_contact_email: normalizeSentinel(result.email_cms),
    subscriber_count: result.subscriber_count ?? null,
    total_views: result.total_views ?? null,
    video_count: result.video_count ?? null,
    avatar_url: result.avatar ?? null,
    provider_status: result.status ?? null,
    raw_response: result,
  };
}
