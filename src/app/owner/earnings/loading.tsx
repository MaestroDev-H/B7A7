import { StatGridSkeleton } from "@/components/shared/Skeletons";

export default function OwnerEarningsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <StatGridSkeleton count={4} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 rounded-xl bg-muted/40 animate-pulse border border-border" />
        <div className="h-64 rounded-xl bg-muted/40 animate-pulse border border-border" />
      </div>
    </div>
  );
}
