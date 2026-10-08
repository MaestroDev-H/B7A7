import "server-only";
import { cookies } from "next/headers";
import { decodeJwt } from "jose";
import { cache } from "react";
import type { User } from "@/lib/api/types";
import { serverFetch } from "@/lib/api/http.server";
import {
  type SessionUser,
  type JwtPayload,
  ROLE_HOME_MAP,
  roleHome,
  safeNext,
} from "@/lib/auth/utils";

export { type SessionUser, type JwtPayload, ROLE_HOME_MAP, roleHome, safeNext };

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
