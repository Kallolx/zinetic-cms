import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDashboardSession } from "@/lib/supabase/dashboard-session";
import { createSslcommerzSession } from "@/lib/sslcommerz";
import { fail, requireStudioUser } from "@/lib/studio/run";

export const runtime = "nodejs";

const MIN_USD = 5;
const MAX_USD = 500;
const RATE = Number(process.env.NEXT_PUBLIC_USD_TO_BDT_RATE ?? 122);

// Buys AI Studio credits. This is its own flow and fills the Studio wallet only,
// the Channel Checker wallet and its top-up are untouched.
export async function POST(request: Request) {
  const auth = await requireStudioUser();
  if ("error" in auth) return auth.error;
  const { profile } = await getDashboardSession();

  const body = (await request.json().catch(() => null)) as { usd?: number; agreed?: boolean } | null;
  const usd = Math.round(Number(body?.usd) * 100) / 100;
  if (!body?.agreed) return fail("You must agree to the Terms, Privacy Policy and Refund Policy to continue.");
  if (!Number.isFinite(usd) || usd < MIN_USD || usd > MAX_USD) return fail(`Choose an amount between $${MIN_USD} and $${MAX_USD}.`);

  const bdt = Math.round(usd * RATE * 100) / 100;
  const tranId = `zs_${auth.userId.slice(0, 8)}_${Date.now()}`;
  const admin = createAdminClient();
  const { error } = await admin.from("payment_sessions").insert({
    user_id: auth.userId,
    tran_id: tranId,
    amount: bdt,
    usd_amount: usd,
    status: "pending",
    wallet: "studio",
  });
  if (error) return fail("Could not start the payment.", 500);

  const session = await createSslcommerzSession({
    tranId,
    amount: bdt,
    customerName: profile?.full_name ?? profile?.email ?? "Customer",
    customerEmail: profile?.email ?? "",
    productName: "AI Studio credits",
  });
  if (!session.ok) {
    await admin.from("payment_sessions").update({ status: "failed" }).eq("tran_id", tranId);
    return fail(session.error, 502);
  }
  return NextResponse.json({ gatewayPageUrl: session.gatewayPageUrl });
}
