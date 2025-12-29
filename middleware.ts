import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    // If no password is configured in development, allow access
    if (!passwordHash && process.env.NODE_ENV === "development") {
      return NextResponse.next();
    }

    // Check for session cookie
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME);

    if (!sessionToken?.value) {
      // Redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
