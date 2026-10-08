"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Root application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <div className="space-y-2">
          <h1 className="h2-display font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {error.message || "An unexpected application error occurred. Our team has been notified."}
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-muted-foreground/60">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button onClick={reset} variant="default" className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}>
            <Home className="mr-2 h-4 w-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
