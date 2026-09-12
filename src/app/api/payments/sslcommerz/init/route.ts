import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createSslcommerzSession } from "@/lib/sslcommerz";

const MIN_TOPUP_USD = 5;
const MAX_TOPUP_USD = 1000;
const USD_TO_BDT_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT_RATE ?? 120);

export async function POST(request: Request) {
  const { user, profile } = await getDashboardSession();
  if (!user || !profile) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { amount, agreedToPolicies } = await request.json();
  const usdAmount = Number(amount);

  if (!agreedToPolicies) {
    return NextResponse.json(
      { error: "You must agree to the Terms, Privacy Policy, and Refund Policy to continue." },
      { status: 400 }
    );
  }
  if (!Number.isFinite(usdAmount) || usdAmount < MIN_TOPUP_USD || usdAmount > MAX_TOPUP_USD) {
    return NextResponse.json(
      { error: `Enter an amount between $${MIN_TOPUP_USD} and $${MAX_TOPUP_USD}.` },
      { status: 400 }
    );
  }

  // SSLCommerz only settles in BDT, the wallet stays in USD, so convert
  // just the amount actually charged through the gateway
  const bdtAmount = Math.round(usdAmount * USD_TO_BDT_RATE * 100) / 100;

  const admin = createAdminClient();
  const tranId = `zc_${user.id.slice(0, 8)}_${Date.now()}`;

  const { error: insertError } = await admin.from("payment_sessions").insert({
    user_id: user.id,
    tran_id: tranId,
    amount: bdtAmount,
    usd_amount: usdAmount,
    status: "pending",
  });

  if (insertError) {
    return NextResponse.json({ error: "Could not start the payment session." }, { status: 500 });
  }

  const result = await createSslcommerzSession({
    tranId,
    amount: bdtAmount,
    customerName: profile.full_name ?? profile.email,
    customerEmail: profile.email,
  });

  if (!result.ok) {
    await admin.from("payment_sessions").update({ status: "failed" }).eq("tran_id", tranId);
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ gatewayPageUrl: result.gatewayPageUrl });
}
