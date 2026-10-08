import { DetailSkeleton } from "@/components/shared/Skeletons";

export default function OwnerTenancyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Owner tenancy billing breakdown and payments coming together in the next step.
      </div>
    </div>
  );
}
