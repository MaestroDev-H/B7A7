"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { MailCheck, ArrowRight, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { verifyEmailAction, resendOtpAction } from "@/actions/auth";
import { useAuthStore } from "@/stores/auth-store";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = React.useState(initialEmail);
  const [otp, setOtp] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  const setUser = useAuthStore((s) => s.setUser);

  // Countdown timer for resend OTP cooldown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  async function handleVerify(codeToSubmit?: string) {
    const code = codeToSubmit || otp;
    if (!email.trim()) {
      toast.error("Please provide your email address");
      return;
    }
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyEmailAction(email.trim(), code);

      if (!result.ok) {
        toast.error(result.message || "Invalid or expired verification code");
        setIsSubmitting(false);
        return;
      }

      if (result.data) {
        setUser(result.data.user);
        toast.success(result.message || "Email verified successfully!");
        router.push(result.data.redirectUrl);
        router.refresh();
      }
    } catch {
      toast.error("Verification failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      toast.error("Please enter your email to resend OTP");
      return;
    }
    if (cooldown > 0) return;

    setIsResending(true);
    try {
      const result = await resendOtpAction(email.trim());
      if (!result.ok) {
        toast.error(result.message || "Failed to resend code");
        setIsResending(false);
        return;
      }

      toast.success(result.message || "A fresh verification code has been sent!");
      setCooldown(60);
    } catch {
      toast.error("Could not resend code. Please try again later.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <div className="inline-flex h-12 w-12 rounded-xl bg-primary/10 text-primary items-center justify-center mb-2">
          <MailCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold font-display tracking-tight">Verify your email</h2>
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit verification code sent to your registered email address.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <Label htmlFor="email-input">Email address</Label>
          <div className="relative">
            <Input
              id="email-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* 6-Digit OTP Input */}
        <div className="space-y-2 pt-2">
          <Label>6-Digit Verification Code</Label>
          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (val.length === 6) {
                  handleVerify(val);
                }
              }}
              disabled={isSubmitting}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="button"
          className="w-full font-medium"
          disabled={isSubmitting || otp.length !== 6 || !email.trim()}
          onClick={() => handleVerify()}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify &amp; Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {/* Resend OTP */}
        <div className="flex items-center justify-between text-xs pt-2">
          <span className="text-muted-foreground">Didn&apos;t receive a code?</span>
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
            disabled={cooldown > 0 || isResending || !email.trim()}
            onClick={handleResend}
          >
            {isResending ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              "Resend code"
            )}
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground pt-4 border-t border-border">
        Need to use a different account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Return to Sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <React.Suspense
      fallback={
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailContent />
    </React.Suspense>
  );
}
