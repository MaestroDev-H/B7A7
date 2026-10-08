import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Notifications"
        description="Stay updated with incoming viewing requests, applications, and repair tickets."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Notifications center coming together in the next step.
      </div>
    </div>
  );
}
