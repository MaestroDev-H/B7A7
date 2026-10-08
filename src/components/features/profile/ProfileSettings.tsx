"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User as UserIcon, Lock, Mail, Phone, Shield, Loader2, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser, useUpdateProfile, useChangePassword } from "@/hooks/use-users";
import { logoutAction } from "@/actions/auth";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfileSettings() {
  const router = useRouter();
  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Profile Form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      avatar: user?.avatar || "",
    },
    values: user
      ? {
          name: user.name,
          phone: user.phone || "",
          avatar: user.avatar || "",
        }
      : undefined,
  });

  // Password Form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync({
      name: data.name,
      phone: data.phone || undefined,
      avatar: data.avatar || undefined,
    });
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      passwordForm.reset();
      toast.success("Password updated successfully! Signing you out for security...");
      setIsLoggingOut(true);

      setTimeout(async () => {
        await logoutAction();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password";
      toast.error(msg);
    }
  };

  const avatarValue = profileForm.watch("avatar");

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Account Profile & Security"
        description="Update your personal details, profile image, contact number, and login credentials."
      />

      {/* Account Info Summary Card */}
      {user && (
        <Card className="bg-gradient-to-r from-card to-muted/30 border">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/30 flex items-center justify-center font-bold text-2xl text-primary shrink-0 shadow-sm">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h3 className="text-xl font-bold text-foreground font-display">{user.name}</h3>
                <StatusBadge status={user.role} />
                {user.isVerified && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Profile Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" />
            Personal Profile Details
          </CardTitle>
          <CardDescription className="text-xs">
            Manage public name, phone number for landlord communications, and avatar photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="profile-form" onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Profile Picture</label>
              <ImageUploader
                value={avatarValue ? [avatarValue] : []}
                onChange={(urls) => profileForm.setValue("avatar", urls[0] || "", { shouldValidate: true })}
                folder="avatars"
                maxFiles={1}
                description="Upload a clear square photo. Resized and compressed automatically."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input placeholder="Your full name" {...profileForm.register("name")} />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="+880 1700-000000"
                    className="pl-9"
                    {...profileForm.register("phone")}
                  />
                </div>
                {profileForm.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email (Read only) */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Email Address</label>
              <Input value={user?.email || ""} disabled className="bg-muted/50 cursor-not-allowed" />
              <p className="text-[11px] text-muted-foreground">
                Email address is linked to your account authentication and cannot be changed directly.
              </p>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            type="submit"
            form="profile-form"
            disabled={updateProfileMutation.isPending}
            className="shadow-xs"
          >
            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Profile Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Change Password Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription className="text-xs">
            For security, updating your password will immediately revoke active sessions and require you to sign in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="password-form" onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Current Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">New Password</label>
                <Input
                  type="password"
                  placeholder="Min 8 characters"
                  {...passwordForm.register("newPassword")}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  {...passwordForm.register("confirmPassword")}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-4">
          <Button
            type="submit"
            form="password-form"
            variant="destructive"
            disabled={changePasswordMutation.isPending || isLoggingOut}
          >
            {(changePasswordMutation.isPending || isLoggingOut) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            <KeyRound className="w-4 h-4 mr-1.5" />
            Update Password
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
