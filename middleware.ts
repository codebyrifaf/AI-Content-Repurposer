import { NextResponse, type NextRequest } from "next/server";
import { buildAdminPanelUrl } from "@/lib/admin/panel-url";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (isAdminApi) {
    return NextResponse.json(
      {
        error:
          "Admin APIs moved to the separate admin app. Use the admin app endpoints instead.",
      },
      { status: 410 }
    );
  }

  if (isAdminRoute) {
    const suffix = pathname.slice("/admin".length);
    const targetPath = suffix.length > 0 ? suffix : "/";
    const target = new URL(buildAdminPanelUrl(targetPath));
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target);
  }

  const response = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient(request, response);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!user && isDashboardRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)",
    "/api/admin/:path*",
  ],
};
