import { DetailSkeleton } from "@/components/shared/Skeletons";

export default function PaymentCancelLoading() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <DetailSkeleton />
    </div>
  );
}
