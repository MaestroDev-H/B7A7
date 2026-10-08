import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerNewPropertyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="List New Property"
        description="5-step wizard to configure residence details, location, amenities, photos, and room keys."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Property listing wizard coming together in the next step.
      </div>
    </div>
  );
}
