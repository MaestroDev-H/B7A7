import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerViewingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Incoming Viewing Requests"
        description="Review, confirm, and manage viewing appointments requested by prospective tenants."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner viewings management table coming together in the next step.
      </div>
    </div>
  );
}
