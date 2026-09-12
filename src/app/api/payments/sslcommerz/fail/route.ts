import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = String(form.get("tran_id") ?? "");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  return NextResponse.redirect(
    `${appUrl}/dashboard/wallet?payment=failed&tran_id=${encodeURIComponent(tranId)}`,
    { status: 303 }
  );
}

export async function GET(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  return NextResponse.redirect(`${appUrl}/dashboard/wallet?payment=failed`, { status: 303 });
}
