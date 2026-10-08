import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerMaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance Board"
        description="Kanban workflow to track, prioritize, and resolve property repair tickets."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner maintenance Kanban board coming together in the next step.
      </div>
    </div>
  );
}
