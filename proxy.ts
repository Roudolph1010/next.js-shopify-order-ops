import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/webhooks"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySession(token);

  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  // Role-based route protection
  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/staff", request.url));
  }

  // Redirect root to role-appropriate dashboard
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session.role === "ADMIN" ? "/admin" : "/staff", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
