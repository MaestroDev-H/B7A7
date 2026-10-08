import { PageHeader } from "@/components/shared/PageHeader";

export default function OwnerEarningsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings &amp; Occupancy Analytics"
        description="Projected monthly rent, occupancy rates, and collected revenue metrics."
      />
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner earnings stats and interactive charts coming together in the next step.
      </div>
    </div>
  );
}
