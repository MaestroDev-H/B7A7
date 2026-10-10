import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { VerifyEmailForm } from "@/components/features/auth/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Enter your 6-digit OTP code to verify your Nestly account email.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
