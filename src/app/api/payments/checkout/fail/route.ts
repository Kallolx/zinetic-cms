import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrder } from "@/lib/checkout";

export const runtime = "nodejs";

async function handle(request: Request, tranId: string) {
  const order = tranId ? await getOrder(tranId) : null;
  if (order && order.status === "pending") {
    await createAdminClient().from("checkout_orders").update({ status: "failed" }).eq("id", order.id);
  }
  const site = order?.site_origin ?? (process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin).replace(/\/$/, "");
  const pick = order ? `?service=${encodeURIComponent(order.service)}&plan=${encodeURIComponent(order.plan)}&payment=failed` : "?payment=failed";
  return NextResponse.redirect(`${site}/checkout${pick}`, { status: 303 });
}

export async function POST(request: Request) {
  const form = await request.formData();
  return handle(request, String(form.get("tran_id") ?? ""));
}

export async function GET(request: Request) {
  return handle(request, new URL(request.url).searchParams.get("tran_id") ?? "");
}
