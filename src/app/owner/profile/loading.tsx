import { FormSkeleton } from "@/components/shared/Skeletons";

export default function OwnerProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />
      <FormSkeleton fields={5} />
    </div>
  );
}
