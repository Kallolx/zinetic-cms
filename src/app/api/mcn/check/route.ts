import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { normalizeSentinel, fetchProviderChannel } from "@/lib/mcn-provider";
import { formatCredits } from "@/lib/credits";

const CHECK_PRICE = Number(process.env.NEXT_PUBLIC_CHECK_PRICE ?? 15);

function extractChannelId(input: string) {
  const trimmed = input.trim();
  const match = trimmed.match(/UC[\w-]{22}/);
  if (match) return match[0];
  // otherwise treat as a handle/custom URL/raw ID, pass through
  return trimmed.replace(/^https?:\/\/(www\.)?youtube\.com\//, "").replace(/^@/, "");
}

/**
 * The real amnhacso API only accepts a channel's actual UC... ID, but users
 * naturally paste a @handle or a full youtube.com/@handle URL. Resolve that
 * to the real channel ID by reading YouTube's public page before ever
 * calling the paid API, otherwise every handle-based check would 404 (and
 * still get charged, since a lookup did run).
 */
async function resolveYouTubeChannelId(input: string): Promise<string | null> {
  const trimmed = input.trim();
  const direct = trimmed.match(/UC[\w-]{22}/);
  if (direct) return direct[0];

  const handle = trimmed
    .replace(/^https?:\/\/(www\.)?youtube\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0];
  if (!handle) return null;

  try {
    const res = await fetch(`https://www.youtube.com/@${encodeURIComponent(handle)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const html = await res.text();

    const canonical = html.match(/<link rel="canonical" href="[^"]*\/channel\/(UC[\w-]{22})"/);
    if (canonical) return canonical[1];

    const externalId = html.match(/"externalId":"(UC[\w-]{22})"/);
    if (externalId) return externalId[1];

    const link = html.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
    if (link) return link[1];

    return null;
  } catch {
    return null;
  }
}

const MOCK_NETWORKS = [
  { network: "Zinetic Music Network", email: "claims@zineticmusic.com" },
  { network: "Sony Music Entertainment", email: "partners@sonymusic.com" },
  { network: "WMG - Wall Music Group", email: "network@wallmusicgroup.com" },
  { network: null, email: null }, // independent, no MCN
];

const MOCK_COUNTRIES = ["US", "BD", "GB", "IN", "CA"];
const MOCK_LANGUAGES = ["English", "Bengali", "English", "Hindi", "English"];
const MOCK_TOPICS = [
  "music",
  "entertainment",
  "vlog",
  "gaming",
  "news & commentary",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Deterministic fake response so the same input always looks the same in
 * demos. Type "notfound" anywhere in the input to preview the not_found
 * state. Toggle with MCN_API_MOCK=true, swap back to false once the real
 * API key's usage is worth spending on.
 */
function mockMcnLookup(channelInput: string, channelId: string) {
  if (channelInput.toLowerCase().includes("notfound")) {
    return { status: "not_found" as const, result: {} };
  }

  let hash = 0;
  for (const char of channelId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const rand = seededRandom(hash || 1);
  const pick = MOCK_NETWORKS[hash % MOCK_NETWORKS.length];
  const topic = MOCK_TOPICS[hash % MOCK_TOPICS.length];
  const channelName = `Demo Channel ${(hash % 999) + 1}`;
  const handle = `@${channelName.toLowerCase().replace(/\s+/g, "")}`;
  const videoCount = (hash % 800) + 1;
  const subscriberCount = (hash % 5_000_000) + 1000;
  const totalViews = (hash % 500_000_000) + 10_000;

  const createdYear = 2012 + (hash % 13);
  const createdMonth = (hash % 12) + 1;
  const createdDay = (hash % 27) + 1;

  const videos = Array.from({ length: 5 }, (_, i) => {
    const vr = rand();
    const daysAgo = Math.floor(vr * 400) + i * 3;
    const publishedAt = new Date(Date.now() - daysAgo * 86_400_000).toISOString();
    return {
      title: `${channelName}, Episode ${videoCount - i}`,
      views: Math.floor(vr * (totalViews / 20)) + 500,
      published_at: publishedAt,
      claim_status: vr > 0.75 ? "claimed" : "clear",
    };
  });

  const monthlyViews = Math.floor(totalViews / 24);
  const estRevenue = Math.round((monthlyViews / 1000) * (1.5 + rand()));

  return {
    status: "success" as const,
    result: {
      channel_id: channelId,
      channel_name: channelName,
      custom_url: handle,
      description: `${channelName} is a ${topic} channel sharing regular uploads with its community. This is demo data generated for testing. No real channel data was fetched.`,
      country_code: MOCK_COUNTRIES[hash % MOCK_COUNTRIES.length],
      language: MOCK_LANGUAGES[hash % MOCK_LANGUAGES.length],
      date_of_creation: `${createdYear}-${String(createdMonth).padStart(2, "0")}-${String(createdDay).padStart(2, "0")}`,
      network: pick.network,
      network_contact_email: pick.email,
      subscriber_count: subscriberCount,
      total_views: totalViews,
      video_count: videoCount,
      avatar: null,
      videos,
      reports: {
        monthly_views: monthlyViews,
        estimated_revenue_usd: estRevenue,
        claims_this_month: videos.filter((v) => v.claim_status === "claimed").length,
        released_claims: Math.max(0, (hash % 4) - 1),
      },
    },
  };
}

export async function POST(request: Request) {
  const { user } = await getDashboardSession();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { channelInput } = await request.json();
  if (!channelInput || typeof channelInput !== "string") {
    return NextResponse.json({ error: "Missing channel link or ID." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("wallet_balance, status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }
  if (profile.status !== "approved") {
    return NextResponse.json({ error: "Account is not approved yet." }, { status: 403 });
  }
  if (Number(profile.wallet_balance) < CHECK_PRICE) {
    return NextResponse.json(
      { error: `Insufficient balance. This check costs ${formatCredits(CHECK_PRICE)}.` },
      { status: 402 }
    );
  }

  const apiBase = process.env.MCN_API_BASE_URL ?? "https://api.amnhacso.com";
  const apiKey = process.env.MCN_API_KEY;
  const isMock = process.env.MCN_API_MOCK === "true";

  let status: "success" | "not_found" | "error" = "success";
  let result: Record<string, unknown> = {};
  let channelId = extractChannelId(channelInput);

  if (isMock) {
    const mocked = mockMcnLookup(channelInput, channelId);
    status = mocked.status;
    result = mocked.result;
  } else {
    try {
      if (!apiKey) throw new Error("MCN_API_KEY is not configured.");

      // resolve @handles / custom URLs to a real UC... ID first, their
      // API only recognizes real channel IDs
      const resolvedId = await resolveYouTubeChannelId(channelInput);
      if (!resolvedId) {
        return NextResponse.json(
          { error: "Couldn't find that YouTube channel. Check the link and try again." },
          { status: 400 }
        );
      }
      channelId = resolvedId;

      let fetched = await fetchProviderChannel(channelId);

      if (fetched.outcome === "not_found") {
        // not in their database yet, register it, then fetch it
        const addRes = await fetch(`${apiBase}/api/v1/channels`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ channels: [channelId] }),
        });

        if (addRes.status === 402) {
          status = "error";
        } else if (addRes.ok) {
          fetched = await fetchProviderChannel(channelId);
          if (fetched.outcome === "not_found") {
            status = "not_found";
          } else if (fetched.outcome === "error") {
            status = "error";
          } else {
            result = fetched.result;
          }
        } else {
          status = "error";
        }
      } else if (fetched.outcome === "error") {
        status = "error";
      } else {
        result = fetched.result;
      }
    } catch {
      status = "error";
    }
  }

  // charge the wallet regardless of a not_found result (a real lookup ran);
  // don't charge on an upstream/config error.
  let walletBalance = Number(profile.wallet_balance);
  if (status !== "error") {
    walletBalance = Number(profile.wallet_balance) - CHECK_PRICE;

    const { error: debitError } = await admin
      .from("profiles")
      .update({ wallet_balance: walletBalance })
      .eq("id", user.id);

    if (!debitError) {
      await admin.from("wallet_transactions").insert({
        user_id: user.id,
        type: "check_charge",
        amount: -CHECK_PRICE,
        note: `MCN check: ${channelInput}`,
      });
    }
  }

  const record = {
    user_id: user.id,
    channel_input: channelInput,
    channel_id: (result.channel_id as string) ?? (status === "success" ? channelId : null),
    channel_name: (result.channel_name as string) ?? null,
    // confirmed against a real API call: the live endpoint returns
    // "network_name" and "email_cms", not "network" / "contact_email".
    // The provider also uses "No Network"/"No Email" as their own sentinel
    // for "none", not a real value, so normalize those to null.
    network: normalizeSentinel(result.network_name as string | undefined),
    network_contact_email: normalizeSentinel(result.email_cms as string | undefined),
    subscriber_count: (result.subscriber_count as number) ?? null,
    total_views: (result.total_views as number) ?? null,
    video_count: (result.video_count as number) ?? null,
    avatar_url: (result.avatar as string) ?? null,
    provider_status: (result.status as string) ?? null,
    status,
    cost: status === "error" ? 0 : CHECK_PRICE,
    raw_response: result,
  };

  const { data: inserted, error: insertError } = await admin
    .from("mcn_checks")
    .insert(record)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Could not save the check result." }, { status: 500 });
  }

  return NextResponse.json({ check: inserted, walletBalance });
}
