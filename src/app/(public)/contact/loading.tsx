import { FormSkeleton } from "@/components/shared/Skeletons";

export default function ContactLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="h-10 w-48 bg-muted rounded animate-pulse" />
      <FormSkeleton fields={4} />
    </div>
  );
}
