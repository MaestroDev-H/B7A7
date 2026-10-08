import { DetailSkeleton } from "@/components/shared/Skeletons";

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        Room details and viewing booking coming together in the next step.
      </div>
    </div>
  );
}
