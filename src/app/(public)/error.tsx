"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Public route error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md space-y-4">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-bold font-display">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        {error.message || "We encountered an issue loading this page."}
      </p>
      <Button onClick={reset} variant="outline" className="mt-2">
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </div>
  );
}
