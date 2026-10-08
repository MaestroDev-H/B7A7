import { CardGridSkeleton } from "@/components/shared/Skeletons";

export default function PublicLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      <div className="h-8 w-64 bg-muted rounded-md animate-pulse" />
      <CardGridSkeleton count={6} />
    </div>
  );
}
