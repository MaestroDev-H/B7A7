"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import type { Role } from "@/lib/api/types";

export interface RoleGateProps {
  allow: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders children if the authenticated user has one of the allowed roles.
 */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { role } = useAuth();
  const allowedRoles = Array.isArray(allow) ? allow : [allow];

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
