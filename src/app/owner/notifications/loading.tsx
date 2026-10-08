import { TableSkeleton } from "@/components/shared/Skeletons";

export default function OwnerNotificationsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <TableSkeleton rows={6} columns={3} />
    </div>
  );
}
