import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { cache } from "react";
import type { Role, User } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/http.server";

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  name?: string;
  avatar?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  exp?: number;
  iat?: number;
}

export const ROLE_HOME_MAP: Record<Role, string> = {
  ADMIN: "/admin",
  OWNER: "/owner",
  TENANT: "/dashboard",
};

export function roleHome(role?: Role | null): string {
  if (!role) return "/login";
  return ROLE_HOME_MAP[role] || "/dashboard";
}

/**
 * Ensures next redirect path is safe and same-origin relative (prevents open redirects)
 */
export function safeNext(path?: string | null): string {
  if (!path) return "";
  const trimmed = path.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("\\")) {
    return trimmed;
  }
  return "";
}

/**
 * Reads accessToken cookie and decodes JWT payload (zero network overhead).
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return null;

    const payload = decodeJwt(token) as unknown as JwtPayload;
    if (!payload?.id || !payload?.role) return null;

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches full User record with React cache memoization per server request.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  try {
    const session = await getSession();
    if (!session) return null;
    return await serverFetch<User>("/users/me");
  } catch {
    return null;
  }
});

/**
 * Cookie setter for auth tokens
 */
export async function setAuthCookies(tokens: { accessToken: string; refreshToken: string }) {
  const cookieStore = await cookies();

  let accessMaxAge = 15 * 60; // 15 min default
  try {
    const payload = decodeJwt(tokens.accessToken);
    if (payload.exp) {
      const remaining = payload.exp - Math.floor(Date.now() / 1000);
      if (remaining > 0) accessMaxAge = remaining;
    }
  } catch {
    // Keep default
  }

  cookieStore.set("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  cookieStore.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clears authentication cookies
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}
