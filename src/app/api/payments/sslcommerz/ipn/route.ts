import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { validateSslcommerzTransaction } from "@/lib/sslcommerz";

/**
 * Server-to-server notification from SSLCommerz. This is the only place
 * that ever credits a wallet for a top-up, never the browser-facing
 * success/fail/cancel redirects, which a user's browser could spoof.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = String(form.get("tran_id") ?? "");
  const valId = String(form.get("val_id") ?? "");

  if (!tranId || !valId) {
    return NextResponse.json({ error: "Missing tran_id or val_id." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: session, error: sessionError } = await admin
    .from("payment_sessions")
    .select("id, user_id, amount, status")
    .eq("tran_id", tranId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Unknown transaction." }, { status: 404 });
  }

  // already processed, IPNs can be sent more than once
  if (session.status === "valid") {
    return NextResponse.json({ ok: true });
  }

  const validation = await validateSslcommerzTransaction(valId);
  const rawIpn = Object.fromEntries(form.entries());

  if (!validation.ok) {
    await admin
      .from("payment_sessions")
      .update({ status: "failed", raw_ipn: rawIpn })
      .eq("id", session.id);
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  if (validation.tranId !== tranId || Math.abs(validation.amount - Number(session.amount)) > 0.01) {
    await admin
      .from("payment_sessions")
      .update({ status: "failed", raw_ipn: rawIpn })
      .eq("id", session.id);
    return NextResponse.json({ error: "Transaction/amount mismatch." }, { status: 400 });
  }

  // SSLCommerz flags certain transactions for manual review, hold instead
  // of crediting automatically
  if (validation.riskLevel === "1") {
    await admin
      .from("payment_sessions")
      .update({ status: "pending", val_id: valId, card_type: validation.cardType, raw_ipn: rawIpn })
      .eq("id", session.id);
    return NextResponse.json({ ok: true, held: true });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("wallet_balance")
    .eq("id", session.user_id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const newBalance = Number(profile.wallet_balance) + Number(session.amount);

  await admin.from("profiles").update({ wallet_balance: newBalance }).eq("id", session.user_id);
  await admin.from("wallet_transactions").insert({
    user_id: session.user_id,
    type: "topup",
    amount: Number(session.amount),
    note: `SSLCommerz top-up (${tranId})`,
  });
  await admin
    .from("payment_sessions")
    .update({
      status: "valid",
      val_id: valId,
      card_type: validation.cardType,
      raw_ipn: rawIpn,
      validated_at: new Date().toISOString(),
    })
    .eq("id", session.id);

  return NextResponse.json({ ok: true });
}
