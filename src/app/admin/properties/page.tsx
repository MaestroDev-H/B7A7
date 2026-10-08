import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminPropertiesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Listing Moderation"
        description="Review all published properties, inspect room details, unpublish, or remove listings."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Admin property moderation table coming together in the next step.
      </div>
    </div>
  );
}
