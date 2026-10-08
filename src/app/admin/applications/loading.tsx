import { TableSkeleton } from "@/components/shared/Skeletons";

export default function AdminApplicationsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <TableSkeleton rows={8} columns={6} />
    </div>
  );
}
