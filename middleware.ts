import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "admin_session";
const USER_SESSION_COOKIE = "user_session";

// Routes requiring user login (full page redirect)
const USER_PROTECTED_ROUTES = ["/articles"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    // If no password is configured in development, allow access
    if (!passwordHash && process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE);

    if (!sessionToken?.value) {
      // Redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect user routes (articles, etc.)
  if (USER_PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const userSession = request.cookies.get(USER_SESSION_COOKIE);

    if (!userSession?.value) {
      // Redirect to user login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/articles/:path*"],
};
