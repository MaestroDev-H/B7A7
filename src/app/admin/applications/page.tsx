import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminApplicationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Applications Oversight"
        description="Cross-platform oversight on all rental applications, tenant submissions, and approvals."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Admin applications review table coming together in the next step.
      </div>
    </div>
  );
}
