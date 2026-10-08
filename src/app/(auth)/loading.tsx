import { FormSkeleton } from "@/components/shared/Skeletons";

export default function AuthLoading() {
  return (
    <div className="max-w-md mx-auto py-12">
      <FormSkeleton />
    </div>
  );
}
