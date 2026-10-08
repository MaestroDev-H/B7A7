import type { Role } from "@/lib/api/types";

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
