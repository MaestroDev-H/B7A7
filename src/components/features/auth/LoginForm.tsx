"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Shield, Building2, UserCheck, ArrowRight, Loader2, KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginAction, demoLoginAction } from "@/actions/auth";
import type { Role } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface DemoCardConfig {
  role: Role;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
}

const DEMO_CARDS: DemoCardConfig[] = [
  {
    role: "TENANT",
    title: "Tenant Demo",
    badge: "Room Seeker",
    description: "Browse curated rooms, submit viewing requests, roommate matching & Stripe payments.",
    icon: UserCheck,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    borderColor: "hover:border-emerald-500/40",
  },
  {
    role: "OWNER",
    title: "Owner Demo",
    badge: "Property Host",
    description: "5-step property wizard, room management, invoice generation & maintenance board.",
    icon: Building2,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    borderColor: "hover:border-amber-500/40",
  },
  {
    role: "ADMIN",
    title: "Admin Console",
    badge: "Platform Admin",
    description: "System stats, user moderation, audit logs & cross-platform applications oversight.",
    icon: Shield,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    borderColor: "hover:border-blue-500/40",
  },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || undefined;
  const denied = searchParams.get("denied");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [activeDemoRole, setActiveDemoRole] = React.useState<Role | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = React.useState<string | null>(null);

  const setUser = useAuthStore((s) => s.setUser);

  React.useEffect(() => {
    if (denied === "1") {
      toast.error("Access denied. Please log in with the authorized account.");
    }
  }, [denied]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    setUnverifiedEmail(null);

    try {
      const result = await loginAction(null, { ...values, next });

      if (!result.ok) {
        if (result.message?.toLowerCase().includes("not verified")) {
          setUnverifiedEmail(values.email);
        }
        toast.error(result.message || "Failed to log in");
        setIsSubmitting(false);
        return;
      }

      if (result.data) {
        setUser(result.data.user);
        toast.success(`Welcome back, ${result.data.user.name}!`);
        router.push(result.data.redirectUrl);
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred during login");
      setIsSubmitting(false);
    }
  }

  async function handleDemoLogin(role: Role) {
    setActiveDemoRole(role);
    try {
      const result = await demoLoginAction(role, next);

      if (!result.ok) {
        toast.error(result.message || `Failed to log in as ${role}`);
        setActiveDemoRole(null);
        return;
      }

      if (result.data) {
        setUser(result.data.user);
        toast.success(`Logged in as ${role.toLowerCase()} demo account!`);
        router.push(result.data.redirectUrl);
        router.refresh();
      }
    } catch {
      toast.error("Demo login service failed");
      setActiveDemoRole(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold font-display tracking-tight">Sign in to your account</h2>
        <p className="text-sm text-muted-foreground">
          Enter your credentials or choose a 1-click demo role below.
        </p>
      </div>

      {unverifiedEmail && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center justify-between">
          <span>Your email is not verified yet.</span>
          <Link
            href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
            className="font-semibold underline underline-offset-2 hover:opacity-80"
          >
            Verify now &rarr;
          </Link>
        </div>
      )}

      {/* Main Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting || activeDemoRole !== null}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                </div>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    disabled={isSubmitting || activeDemoRole !== null}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={isSubmitting || activeDemoRole !== null}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create account
        </Link>
      </div>

      {/* Quick Demo Login Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground font-semibold tracking-wider flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5" />
            Quick Demo Login
          </span>
        </div>
      </div>

      {/* 3 Demo Cards */}
      <div className="grid grid-cols-1 gap-3">
        {DEMO_CARDS.map((card) => {
          const Icon = card.icon;
          const isThisLoading = activeDemoRole === card.role;
          const isAnyLoading = isSubmitting || activeDemoRole !== null;

          return (
            <Card
              key={card.role}
              className={`transition-all duration-200 border-border/80 ${card.borderColor}`}
            >
              <CardContent className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-9 w-9 rounded-lg ${card.color} flex items-center justify-center shrink-0`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold leading-none">{card.title}</h4>
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {card.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                      {card.description}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 text-xs h-8"
                  disabled={isAnyLoading}
                  onClick={() => handleDemoLogin(card.role)}
                >
                  {isThisLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Demo Login"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
