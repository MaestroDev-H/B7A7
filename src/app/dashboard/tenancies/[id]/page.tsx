import type { Metadata } from "next";
import { HydrationBoundary } from "@tanstack/react-query";
import { serverFetch } from "@/lib/api/http.server";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { queryKeys } from "@/lib/queries/keys";
import { prefetchAndDehydrate } from "@/lib/queries/prefetch";
import { TenantTenancyDetailView } from "@/components/features/tenancies/TenantTenancyDetailView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const tenancy = await tenanciesService.getById(serverFetch, id);
    const title = tenancy.room?.property?.title || "Tenancy Agreement";
    return {
      title: `${title} | My Tenancies`,
      description: `Tenancy agreement details for unit ${tenancy.room?.roomNumber || ""}`,
    };
  } catch {
    return {
      title: "Tenancy Details",
      description: "View tenancy agreement and invoice schedule",
    };
  }
}

export default async function TenantTenancyDetailPage({ params }: PageProps) {
  const { id } = await params;

  const dehydratedState = await prefetchAndDehydrate([
    {
      queryKey: queryKeys.tenancies.detail(id),
      queryFn: () => tenanciesService.getById(serverFetch, id),
    },
  ]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <TenantTenancyDetailView tenancyId={id} />
    </HydrationBoundary>
  );
}
