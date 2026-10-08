"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserIcon, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/actions/auth";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import type { Role } from "@/lib/api/types";

function getRoleBadgeVariant(role?: Role | null) {
  switch (role) {
    case "ADMIN":
      return { label: "Admin", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" };
    case "OWNER":
      return { label: "Owner", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
    case "TENANT":
    default:
      return { label: "Tenant", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
  }
}

export function UserMenu() {
  const { user, role, isAdmin, isOwner } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const roleMeta = getRoleBadgeVariant(role);
  const profileLink = isAdmin
    ? "/admin/settings"
    : isOwner
    ? "/owner/profile"
    : "/dashboard/profile";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      clearUser();
      await logoutAction();
    } catch {
      toast.error("Logout failed");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all outline-none cursor-pointer"
            aria-label="Open user menu"
          >
            <Avatar className="h-8 w-8 border border-border">
              {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || "User"} />}
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />

      <DropdownMenuContent align="end" className="w-60 shadow-lg border-border">
        <DropdownMenuLabel className="font-normal p-3 pb-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold leading-none truncate">{user?.name || "User"}</p>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${roleMeta.className}`}>
                {roleMeta.label}
              </Badge>
            </div>
            <p className="text-[11px] leading-none text-muted-foreground truncate">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem render={<Link href={profileLink} className="flex items-center gap-2 w-full cursor-pointer" />}>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          <span>Profile &amp; Account</span>
        </DropdownMenuItem>

        {isOwner && (
          <DropdownMenuItem render={<Link href="/owner/earnings" className="flex items-center gap-2 w-full cursor-pointer" />}>
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Earnings Analytics</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          <span>{isLoggingOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
