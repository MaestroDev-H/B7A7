"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/lib/api/types";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const role = user?.role ?? null;
  const isAdmin = role === "ADMIN";
  const isOwner = role === "OWNER";
  const isTenant = role === "TENANT";

  const isRole = (...roles: Role[]) => {
    return role ? roles.includes(role) : false;
  };

  return {
    user,
    role,
    isAuthenticated: !!user,
    isAdmin,
    isOwner,
    isTenant,
    isRole,
    setUser,
    clearUser,
  };
}
