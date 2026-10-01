import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Completes a one-time sign-in link (made after a verified payment) and starts the session
// on this domain, then sends the customer to their dashboard.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const next = searchParams.get("next") ?? "/";
  // only ever redirect to a path on this site
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (tokenHash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type: "magiclink", token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/login`);
}
