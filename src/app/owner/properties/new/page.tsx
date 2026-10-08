import type { Metadata } from "next";
import { PropertyWizard } from "@/components/features/owner/wizard/PropertyWizard";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "List New Property",
  description: "Add a residential property and configure room units with our 5-step wizard.",
};

export default function NewPropertyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="List New Property"
        description="Follow the 5 steps below to publish your rental property and room inventories."
      />
      <PropertyWizard />
    </div>
  );
}
