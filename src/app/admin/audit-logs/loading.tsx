import { TableSkeleton } from "@/components/shared/Skeletons";

export default function AdminAuditLogsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <TableSkeleton rows={10} columns={5} />
    </div>
  );
}
