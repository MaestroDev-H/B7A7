import * as React from "react";
import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/guard";
import { getCurrentUser } from "@/lib/auth/session";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthHydrator } from "@/components/providers/auth-hydrator";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("OWNER");
  const user = await getCurrentUser();

  return (
    <AuthHydrator user={user}>
      <DashboardShell>{children}</DashboardShell>
    </AuthHydrator>
  );
}
