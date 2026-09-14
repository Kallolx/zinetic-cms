import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");
  const isProtectedRoute =
    path.startsWith("/dashboard") || path.startsWith("/admin") || path.startsWith("/pending");

  // the app's own subdomain (e.g. cms.zineticmusic.com) is the service,
  // every other host (the marketing domain, the .vercel.app domain) is
  // informational only and keeps its own landing page at "/". Any actual
  // app route reached from a non-app host always bounces over to the app
  // host, so auth and the app itself never actually run anywhere else.
  const appHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_APP_URL ?? "").hostname;
    } catch {
      return "";
    }
  })();
  const requestHost = (request.headers.get("host") ?? "").split(":")[0];
  const isAppHost = Boolean(appHost) && requestHost === appHost;

  if (appHost && !isAppHost && (isAuthRoute || isProtectedRoute)) {
    const url = request.nextUrl.clone();
    url.host = appHost;
    url.port = "";
    return NextResponse.redirect(url);
  }

  if (isAppHost && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
