import { DetailSkeleton } from "@/components/shared/Skeletons";

export default function TenantRoommatesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <DetailSkeleton />
    </div>
  );
}
