import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createSslcommerzSession } from "@/lib/sslcommerz";

const MIN_TOPUP = 100;
const MAX_TOPUP = 50000;

export async function POST(request: Request) {
  const { user, profile } = await getDashboardSession();
  if (!user || !profile) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { amount, agreedToPolicies } = await request.json();
  const value = Number(amount);

  if (!agreedToPolicies) {
    return NextResponse.json(
      { error: "You must agree to the Terms, Privacy Policy, and Refund Policy to continue." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(value) || value < MIN_TOPUP || value > MAX_TOPUP) {
    return NextResponse.json(
      { error: `Enter an amount between ${MIN_TOPUP} and ${MAX_TOPUP} BDT.` },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const tranId = `zc_${user.id.slice(0, 8)}_${Date.now()}`;

  const { error: insertError } = await admin.from("payment_sessions").insert({
    user_id: user.id,
    tran_id: tranId,
    amount: value,
    status: "pending",
  });

  if (insertError) {
    return NextResponse.json({ error: "Could not start the payment session." }, { status: 500 });
  }

  const result = await createSslcommerzSession({
    tranId,
    amount: value,
    customerName: profile.full_name ?? profile.email,
    customerEmail: profile.email,
  });

  if (!result.ok) {
    await admin.from("payment_sessions").update({ status: "failed" }).eq("tran_id", tranId);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ gatewayPageUrl: result.gatewayPageUrl });
}
