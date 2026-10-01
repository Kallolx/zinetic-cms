import { NextResponse } from "next/server";
import { finalizeOrder } from "@/lib/checkout";

export const runtime = "nodejs";

// Server-to-server notification from SSLCommerz. It does the same verified unlock as the
// browser redirect, so a customer who closes the tab after paying is still approved.
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = String(form.get("tran_id") ?? "");
  const valId = String(form.get("val_id") ?? "");
  if (!tranId || !valId) return NextResponse.json({ error: "Missing tran_id or val_id." }, { status: 400 });

  const result = await finalizeOrder(tranId, valId, Object.fromEntries(form.entries()));
  if (!result.ok && !result.held) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, held: !result.ok });
}
