import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Where the customer lands after the gateway: the Studio wallet for a Studio top-up,
// the Channel Checker wallet for everything else. The IPN route does the crediting.
async function walletUrl(request: Request, tranId: string, status: string) {
  const strip = (u?: string) => (u ?? "").replace(/\/$/, "");
  let studio = false;
  if (tranId) {
    const { data } = await createAdminClient().from("payment_sessions").select("wallet").eq("tran_id", tranId).maybeSingle();
    studio = data?.wallet === "studio";
  }
  const base = studio ? strip(process.env.NEXT_PUBLIC_STUDIO_URL) : strip(process.env.NEXT_PUBLIC_APP_URL) || new URL(request.url).origin;
  const path = studio ? "/studio/wallet" : "/dashboard/wallet";
  return `${base}${path}?payment=${status}${tranId ? `&tran_id=${encodeURIComponent(tranId)}` : ""}`;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = String(form.get("tran_id") ?? "");
  return NextResponse.redirect(await walletUrl(request, tranId, "failed"), { status: 303 });
}

export async function GET(request: Request) {
  const tranId = new URL(request.url).searchParams.get("tran_id") ?? "";
  return NextResponse.redirect(await walletUrl(request, tranId, "failed"), { status: 303 });
}
