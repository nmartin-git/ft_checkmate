import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "always"
});

const protectedRoutes = ["/profile", "/profile/edit", "/messages"];
const protectedApiRoutes = ["/api/auth/me"];

export function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const isProtectedApi = protectedApiRoutes.some((route) =>
      pathname.startsWith(route)
    );
    if (isProtectedApi && !sessionToken) {
      return NextResponse.json(
        { error: "Non autorisé. Veuillez vous connecter." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  );
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/?auth=required", request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/(fr|en|ar)/:path*",
    "/api/:path*",
    "/((?!_next|assets|favicon.ico|.*\\.).*)"
  ],
};