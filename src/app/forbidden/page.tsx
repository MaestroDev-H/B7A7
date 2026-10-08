import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DoorPlate } from "@/components/shared/DoorPlate";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="inline-block">
          <DoorPlate roomNumber="403" size="lg" subtitle="Restricted Access" />
        </div>

        <div className="space-y-2">
          <h1 className="h2-display font-bold">Authorized Keyholders Only</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your current account role does not hold the permissions required to access this portal. Please log in with the appropriate credentials.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href="/login" className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Switch Account / Login
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}>
            <Home className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
