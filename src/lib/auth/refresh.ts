import { cookies } from "next/headers";

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

// Global single-flight map to dedupe concurrent token refreshes
const refreshPromiseMap = new Map<string, Promise<{ accessToken: string; refreshToken: string } | null>>();

/**
 * Single-flight token refresher.
 * When multiple requests encounter an expired accessToken simultaneously,
 * they share the same backend refresh-token exchange to avoid invalidating the rotating token.
 */
export async function refreshSession(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  if (!refreshToken) return null;

  const existingPromise = refreshPromiseMap.get(refreshToken);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        return null;
      }

      const body = await res.json();
      if (!body.success || !body.data?.accessToken) {
        return null;
      }

      const tokens = {
        accessToken: body.data.accessToken as string,
        refreshToken: (body.data.refreshToken as string) || refreshToken,
      };

      // Set updated cookies in next/headers
      const cookieStore = await cookies();
      cookieStore.set("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60, // 15 mins
      });

      cookieStore.set("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return tokens;
    } catch {
      return null;
    } finally {
      refreshPromiseMap.delete(refreshToken);
    }
  })();

  refreshPromiseMap.set(refreshToken, promise);
  return promise;
}
