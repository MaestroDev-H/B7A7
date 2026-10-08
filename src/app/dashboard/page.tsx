import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { viewingsService } from "@/lib/api/services/viewings";
import { applicationsService } from "@/lib/api/services/applications";
import { usersService } from "@/lib/api/services/users";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { TenantOverview } from "@/components/features/dashboard/TenantOverview";

export const metadata: Metadata = {
  title: "Tenant Dashboard",
  description: "Overview of your tenancies, room viewings, applications, and payments.",
};

export default async function TenantDashboardPage() {
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.auth.me,
      queryFn: () => usersService.getMe(serverFetch),
    },
    {
      queryKey: queryKeys.tenancies.mine,
      queryFn: () => tenanciesService.getMyTenancies(serverFetch),
    },
    {
      queryKey: queryKeys.viewings.mine,
      queryFn: () => viewingsService.getMyViewings(serverFetch),
    },
    {
      queryKey: queryKeys.applications.mine,
      queryFn: () => applicationsService.getMyApplications(serverFetch),
    },
    {
      queryKey: queryKeys.tenancies.myInvoices,
      queryFn: () => tenanciesService.getMyInvoices(serverFetch),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <TenantOverview />
    </HydrationBoundary>
  );
}
