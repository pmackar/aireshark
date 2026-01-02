import { NextRequest, NextResponse } from "next/server";

const USER_SESSION_COOKIE = "user_session";

// Routes requiring user login (full page redirect)
const USER_PROTECTED_ROUTES = ["/articles", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect user routes (articles, admin, etc.)
  // Admin routes require login - role check happens in the admin page itself
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
