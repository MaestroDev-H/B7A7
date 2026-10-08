import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { OwnerTenancyDetailView } from "@/components/features/owner/OwnerTenancyDetailView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const tenancy = await tenanciesService.getById(serverFetch, id);
    const tenantName = tenancy.tenant?.name || "Resident";
    return {
      title: `Tenancy - ${tenantName}`,
      description: "Manage tenancy invoices, receipts, and lease duration.",
    };
  } catch {
    return {
      title: "Tenancy Details",
    };
  }
}

export default async function OwnerTenancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.tenancies.detail(id),
      queryFn: () => tenanciesService.getById(serverFetch, id),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <OwnerTenancyDetailView tenancyId={id} />
    </HydrationBoundary>
  );
}
