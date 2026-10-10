"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building2, UserCheck, ArrowRight, Loader2, Check, ShieldCheck } from "lucide-react";

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
import { registerAction } from "@/actions/auth";

const registerSchema = z
  .object({
    role: z.enum(["TENANT", "OWNER"]),
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "TENANT",
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedRole = form.watch("role");
  const passwordValue = form.watch("password") || "";

  // Password strength indicators
  const hasLength = passwordValue.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      const result = await registerAction(null, {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        phone: values.phone || undefined,
      });

      if (!result.ok) {
        toast.error(result.message || "Registration failed");
        if (result.errors) {
          result.errors.forEach((err) => {
            if (err.field === "email") form.setError("email", { message: err.message });
            if (err.field === "password") form.setError("password", { message: err.message });
            if (err.field === "name") form.setError("name", { message: err.message });
          });
        }
        setIsSubmitting(false);
        return;
      }

      toast.success(result.message || "Account created! Please check your email for the verification OTP.");
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold font-display tracking-tight">Create your Nestly account</h2>
        <p className="text-sm text-muted-foreground">
          Join our verified housing community. Select your journey below.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Role Chooser Cards */}
          <div className="space-y-2">
            <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              I want to
            </FormLabel>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedRole === "TENANT"
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                    : "border-border hover:border-border/80 opacity-70 hover:opacity-100"
                }`}
                onClick={() => form.setValue("role", "TENANT")}
              >
                <CardContent className="p-3.5 flex flex-col items-center text-center space-y-1.5">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      selectedRole === "TENANT"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <UserCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">Find a Room</h4>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      Join as Tenant
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedRole === "OWNER"
                    ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                    : "border-border hover:border-border/80 opacity-70 hover:opacity-100"
                }`}
                onClick={() => form.setValue("role", "OWNER")}
              >
                <CardContent className="p-3.5 flex flex-col items-center text-center space-y-1.5">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                      selectedRole === "OWNER"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold">List Properties</h4>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                      Join as Owner
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" autoComplete="name" disabled={isSubmitting} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
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
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone (Optional) */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Phone number <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Minimum 8 characters"
                    type="password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                {/* Password strength checklist */}
                <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                  <span className={`inline-flex items-center gap-1 ${hasLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                    <Check className={`h-3 w-3 ${hasLength ? "opacity-100" : "opacity-30"}`} /> 8+ chars
                  </span>
                  <span className={`inline-flex items-center gap-1 ${hasUpper ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                    <Check className={`h-3 w-3 ${hasUpper ? "opacity-100" : "opacity-30"}`} /> 1 uppercase
                  </span>
                  <span className={`inline-flex items-center gap-1 ${hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}`}>
                    <Check className={`h-3 w-3 ${hasNumber ? "opacity-100" : "opacity-30"}`} /> 1 number
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Re-enter your password"
                    type="password"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full font-medium" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in instead
        </Link>
      </div>

      <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>Your data is protected. You will verify your email with a 6-digit one-time code.</span>
      </div>
    </div>
  );
}
