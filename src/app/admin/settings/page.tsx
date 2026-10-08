import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { usersService } from "@/lib/api/services/users";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { AdminSettingsView } from "@/components/features/admin/AdminSettingsView";

export const metadata: Metadata = {
  title: "Admin Settings",
  description: "Administrator account profile, credentials, and system environment info.",
};

export default async function AdminSettingsPage() {
  const apiUrl = process.env.API_BASE_URL || "https://api.nestly.local/api/v1";
  let hostname = "api.nestly.local";
  try {
    hostname = new URL(apiUrl).hostname;
  } catch {
    hostname = apiUrl;
  }

  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.auth.me,
      queryFn: () => usersService.getMe(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <AdminSettingsView apiHostname={hostname} appVersion="1.0.0" />
    </HydrationBoundary>
  );
}
