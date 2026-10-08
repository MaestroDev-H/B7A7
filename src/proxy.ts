import { NextResponse, type NextRequest } from "next/server";
import { decodeJwt } from "jose";
import type { Role } from "@/lib/api/types";
import { ROLE_HOME_MAP } from "@/lib/auth/session";

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  exp?: number;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  let sessionUser: JwtPayload | null = null;

  if (accessToken) {
    try {
      const decoded = decodeJwt(accessToken) as unknown as JwtPayload;
      if (decoded?.exp && decoded.exp * 1000 > Date.now()) {
        sessionUser = decoded;
      }
    } catch {
      // Invalid JWT
    }
  }

  const isGuestOnlyRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/verify-email");

  // 1. If user is authenticated and visits guest-only pages (/login, /register), bounce to role home
  if (isGuestOnlyRoute && sessionUser) {
    const home = ROLE_HOME_MAP[sessionUser.role] || "/dashboard";
    return NextResponse.redirect(new URL(home, req.url));
  }

  // 2. Protected Route Role Matching
  const isProtectedAdmin = pathname.startsWith("/admin");
  const isProtectedOwner = pathname.startsWith("/owner");
  const isProtectedTenant = pathname.startsWith("/dashboard");
  const isProtectedPayment = pathname.startsWith("/payment");

  const isProtectedRoute =
    isProtectedAdmin || isProtectedOwner || isProtectedTenant || isProtectedPayment;

  if (isProtectedRoute) {
    // If completely unauthenticated (no access token and no refresh token), redirect to /login?next=
    if (!sessionUser && !refreshToken) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Role-specific prefix enforcement if sessionUser is already decoded
    if (sessionUser) {
      if (isProtectedAdmin && sessionUser.role !== "ADMIN") {
        const home = ROLE_HOME_MAP[sessionUser.role] || "/dashboard";
        return NextResponse.redirect(new URL(`${home}?denied=1`, req.url));
      }
      if (isProtectedOwner && sessionUser.role !== "OWNER") {
        const home = ROLE_HOME_MAP[sessionUser.role] || "/dashboard";
        return NextResponse.redirect(new URL(`${home}?denied=1`, req.url));
      }
      if (isProtectedTenant && sessionUser.role !== "TENANT") {
        const home = ROLE_HOME_MAP[sessionUser.role] || "/dashboard";
        return NextResponse.redirect(new URL(`${home}?denied=1`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ or public assets
     * - api/ routes
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api).*)",
  ],
};
