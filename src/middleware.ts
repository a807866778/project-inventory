import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple auth check - only verify session cookie exists
// Full auth is done in each page/server component
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Public paths that don't need auth
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionId = request.cookies.get("session_id")?.value;
  if (!sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
