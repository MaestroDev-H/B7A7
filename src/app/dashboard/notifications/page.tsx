import { PageHeader } from "@/components/shared/PageHeader";

export default function TenantNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Review all system alerts, lease updates, and message logs."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Notifications center coming together in the next step.
      </div>
    </div>
  );
}
