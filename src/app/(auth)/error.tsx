"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Auth error:", error);
  }, [error]);

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold font-display tracking-tight">Authentication Error</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "An unexpected error occurred during the authentication process."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Button onClick={reset} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Link href="/login" className={buttonVariants({ variant: "default", className: "w-full sm:w-auto" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
