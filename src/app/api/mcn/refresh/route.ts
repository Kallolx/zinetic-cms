import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { checkId } = await request.json();
  if (!checkId || typeof checkId !== "string") {
    return NextResponse.json({ error: "Missing check ID." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("mcn_checks")
    .select("id, user_id, channel_id, channel_input, status")
    .eq("id", checkId)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Check not found." }, { status: 404 });
  }
  if (existing.user_id !== user.id) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  if (!existing.channel_id) {
    return NextResponse.json(
      { error: "This check has no resolved channel ID to refresh." },
      { status: 400 }
    );
  }

  const apiBase = process.env.MCN_API_BASE_URL ?? "https://api.amnhacso.com";
  const apiKey = process.env.MCN_API_KEY;
  const isMock = process.env.MCN_API_MOCK === "true";

  let status: "success" | "not_found" | "error" = "success";
  let result: Record<string, unknown> = {};

  if (isMock) {
    result = {
      channel_id: existing.channel_id,
      network_name: "Zinetic Music Network (refreshed)",
      email_cms: "claims@zineticmusic.com",
    };
  } else {
    try {
      if (!apiKey) throw new Error("MCN_API_KEY is not configured.");
      const res = await fetch(
        `${apiBase}/api/v1/channels/${encodeURIComponent(existing.channel_id)}`,
        { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" }
      );
      if (res.status === 404) {
        status = "not_found";
      } else if (!res.ok) {
        status = "error";
      } else {
        result = await res.json();
      }
    } catch {
      status = "error";
    }
  }

  if (status === "error") {
    return NextResponse.json(
      { error: "Couldn't refresh this channel right now. Try again later." },
      { status: 502 }
    );
  }

  const update = {
    channel_name: (result.channel_name as string) ?? null,
    network: (result.network_name as string) ?? null,
    network_contact_email: (result.email_cms as string) ?? null,
    subscriber_count: (result.subscriber_count as number) ?? null,
    total_views: (result.total_views as number) ?? null,
    video_count: (result.video_count as number) ?? null,
    avatar_url: (result.avatar as string) ?? null,
    status,
    raw_response: result,
  };

  const { data: updated, error: updateError } = await admin
    .from("mcn_checks")
    .update(update)
    .eq("id", checkId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: "Could not save the refreshed result." }, { status: 500 });
  }

  return NextResponse.json({ check: updated });
}
