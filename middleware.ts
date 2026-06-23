import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
});

const protectedRoutes = ["/profile", "/profile/edit"];
const protectedApiRoutes = ["/api/auth/me"];

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedApi = protectedApiRoutes.some((r) =>
    pathname.startsWith(r)
  );
  if (isProtectedApi && !sessionToken) {
    return NextResponse.json(
      { error: "Non autorisé. Veuillez vous connecter." },
      { status: 401 }
    );
  }


  const isProtectedRoute = protectedRoutes.some((r) =>
    pathname.includes(r)
  );
  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(
      new URL("/?auth=required", request.url)
    );
  }


  return intlMiddleware(request);
}


export const config = {
  matcher: [
    "/",
    "/(fr|en|ar)/:path*",
    "/api/auth/me",
    "/((?!_next|favicon.ico|.*\\..*).*)",
  ],
};
