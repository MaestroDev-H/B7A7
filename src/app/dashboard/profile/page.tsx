import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { usersService } from "@/lib/api/services/users";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { ProfileSettings } from "@/components/features/profile/ProfileSettings";

export const metadata: Metadata = {
  title: "Profile & Account Settings",
  description: "Manage your profile details, avatar, and password credentials.",
};

export default async function DashboardProfilePage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.auth.me,
      queryFn: () => usersService.getMe(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProfileSettings />
    </HydrationBoundary>
  );
}
