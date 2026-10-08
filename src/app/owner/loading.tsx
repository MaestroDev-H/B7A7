import { StatGridSkeleton, CardGridSkeleton } from "@/components/shared/Skeletons";

export default function OwnerLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <StatGridSkeleton count={4} />
      <CardGridSkeleton count={4} />
    </div>
  );
}
