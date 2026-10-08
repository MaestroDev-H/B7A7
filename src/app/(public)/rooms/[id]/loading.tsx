import { DetailSkeleton } from "@/components/shared/Skeletons";

export default function RoomDetailLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DetailSkeleton />
    </div>
  );
}
