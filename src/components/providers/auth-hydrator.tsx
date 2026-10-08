"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/lib/api/types";

export function AuthHydrator({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);

  // Sync user state on mount / update
  React.useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return <>{children}</>;
}
