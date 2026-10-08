import Link from "next/link";
import { Home, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DoorPlate } from "@/components/shared/DoorPlate";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="inline-block">
          <DoorPlate roomNumber="404" size="lg" subtitle="Page Not Found" />
        </div>

        <div className="space-y-2">
          <h1 className="h2-display font-bold">Room or Page Unoccupied</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The doorway you followed doesn&apos;t lead anywhere. It might have been moved, unpublished, or never existed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/" className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}>
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Link>
          <Link href="/properties" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}>
            <Search className="mr-2 h-4 w-4" />
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
