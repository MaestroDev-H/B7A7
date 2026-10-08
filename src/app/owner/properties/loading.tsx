import { CardGridSkeleton } from "@/components/shared/Skeletons";

export default function OwnerPropertiesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <CardGridSkeleton count={4} />
    </div>
  );
}
