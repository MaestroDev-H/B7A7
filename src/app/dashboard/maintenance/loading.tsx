import { TableSkeleton } from "@/components/shared/Skeletons";

export default function TenantMaintenanceLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <TableSkeleton rows={5} columns={4} />
    </div>
  );
}
