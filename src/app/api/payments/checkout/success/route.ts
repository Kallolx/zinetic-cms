import { NextResponse } from "next/server";
import { destinationFor, finalizeOrder, getOrder, signInLink } from "@/lib/checkout";

export const runtime = "nodejs";

const back = (origin: string, path: string) => NextResponse.redirect(`${origin}${path}`, { status: 303 });
const fallbackOrigin = (request: Request) => (process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin).replace(/\/$/, "");

// SSLCommerz sends the customer back here after paying. The payment is verified with
// SSLCommerz first, and only a verified payment unlocks the dashboard and signs them in.
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = String(form.get("tran_id") ?? "");
  const valId = String(form.get("val_id") ?? "");
  const order = tranId ? await getOrder(tranId) : null;
  const site = order?.site_origin ?? fallbackOrigin(request);

  if (!order || !valId) return back(site, "/checkout?payment=failed");

  const result = await finalizeOrder(tranId, valId, Object.fromEntries(form.entries()));
  if (!result.ok) {
    if (result.held) return back(site, "/checkout/success?state=held");
    return back(site, `/checkout?service=${encodeURIComponent(order.service)}&plan=${encodeURIComponent(order.plan)}&payment=failed`);
  }

  const dest = destinationFor(result.order);
  if (!dest) return back(site, `/checkout/success?state=${encodeURIComponent(result.order.product)}`);

  const link = await signInLink(result.order.email, dest.origin, dest.path);
  // if the one-time link cannot be made, the account is still paid and approved, they just log in
  return link ? NextResponse.redirect(link, { status: 303 }) : NextResponse.redirect(`${dest.origin}/login`, { status: 303 });
}

export async function GET(request: Request) {
  return back(fallbackOrigin(request), "/checkout");
}
