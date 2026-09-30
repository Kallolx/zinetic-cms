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

  // getClaims verifies the signed token locally and refreshes the session when it is
  // close to expiring, so a page navigation no longer waits on Supabase Auth
  const { data: claimsData } = await supabase.auth.getClaims();
  const user = claimsData?.claims?.sub ? { id: claimsData.claims.sub as string } : null;

  const path = request.nextUrl.pathname;
  const isAuthRoute =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/reset-password");

  // every dashboard is its own subdomain of the same app. The CMS lives on
  // NEXT_PUBLIC_APP_URL, AI Studio on NEXT_PUBLIC_STUDIO_URL. Auth, admin and
  // Supabase are shared, only the home route differs per host.
  const hostOf = (value?: string) => {
    try {
      return new URL(value ?? "").hostname;
    } catch {
      return "";
    }
  };
  const cmsHost = hostOf(process.env.NEXT_PUBLIC_APP_URL);
  const studioHost = hostOf(process.env.NEXT_PUBLIC_STUDIO_URL);
  const requestHost = (request.headers.get("host") ?? "").split(":")[0];
  const isStudioHost = Boolean(studioHost) && requestHost === studioHost;
  const isAppHost = (Boolean(cmsHost) && requestHost === cmsHost) || isStudioHost;
  const home = isStudioHost ? "/studio" : "/dashboard";

  const isProtectedRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/admin") ||
    path.startsWith("/pending") ||
    path.startsWith("/studio") ||
    path.startsWith("/api/studio");

  // any other host (marketing domain, .vercel.app) stays informational, app
  // routes reached there bounce to the CMS host.
  if (cmsHost && !isAppHost && (isAuthRoute || isProtectedRoute)) {
    const url = request.nextUrl.clone();
    url.host = path.startsWith("/studio") && studioHost ? studioHost : cmsHost;
    url.port = "";
    return NextResponse.redirect(url);
  }

  // the two dashboards never serve each other's pages
  if (isStudioHost && path.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/studio";
    return NextResponse.redirect(url);
  }
  if (isAppHost && !isStudioHost && path.startsWith("/studio") && studioHost) {
    const url = request.nextUrl.clone();
    url.host = studioHost;
    url.port = "";
    return NextResponse.redirect(url);
  }

  if (isAppHost && path === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? home : "/login";
    return NextResponse.redirect(url);
  }

  if (!user && isProtectedRoute) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = home;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
