import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrder } from "@/lib/checkout";

export const runtime = "nodejs";

async function handle(request: Request, tranId: string) {
  const order = tranId ? await getOrder(tranId) : null;
  if (order && order.status === "pending") {
    await createAdminClient().from("checkout_orders").update({ status: "cancelled" }).eq("id", order.id);
  }
  const site = order?.site_origin ?? (process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin).replace(/\/$/, "");
  // a purchase made inside the dashboard returns to that page, a new sign-up to checkout
  if (order?.return_path && order.return_path !== "/checkout") {
    return NextResponse.redirect(`${site}${order.return_path}?payment=cancelled`, { status: 303 });
  }
  const pick = order ? `?service=${encodeURIComponent(order.service)}&plan=${encodeURIComponent(order.plan)}&payment=cancelled` : "?payment=cancelled";
  return NextResponse.redirect(`${site}/checkout${pick}`, { status: 303 });
}

export async function POST(request: Request) {
  const form = await request.formData();
  return handle(request, String(form.get("tran_id") ?? ""));
}

export async function GET(request: Request) {
  return handle(request, new URL(request.url).searchParams.get("tran_id") ?? "");
}
