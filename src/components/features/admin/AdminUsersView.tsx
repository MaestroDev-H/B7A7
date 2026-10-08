"use client";

import * as React from "react";
import { useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Edit,
  Mail,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SearchInput } from "@/components/shared/SearchInput";
import { Pagination } from "@/components/shared/Pagination";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAllUsers,
  useOptimisticUpdateUserRole,
  useDeactivateUser,
} from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { formatDate } from "@/lib/format";
import type { User, Role } from "@/lib/api/types";
import { toast } from "sonner";

export function AdminUsersView() {
  const { user: currentAdmin } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const roleParam = searchParams.get("role") || "ALL";
  const searchParam = searchParams.get("search") || "";

  const { data: usersData, isLoading } = useAllUsers({
    page,
    limit,
    role: roleParam !== "ALL" ? roleParam : undefined,
    search: searchParam || undefined,
  });

  const [roleChangeTarget, setRoleChangeTarget] = useState<User | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<Role>("TENANT");
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [confirmEmailInput, setConfirmEmailInput] = useState("");

  const updateRoleMutation = useOptimisticUpdateUserRole(roleChangeTarget?.id || "");
  const deactivateMutation = useDeactivateUser(deactivateTarget?.id || "");

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenRoleModal = (user: User) => {
    setRoleChangeTarget(user);
    setSelectedNewRole(user.role);
  };

  const handleRoleChangeSubmit = async () => {
    if (!roleChangeTarget) return;
    try {
      await updateRoleMutation.mutateAsync({ role: selectedNewRole });
      setRoleChangeTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change user role";
      toast.error(msg);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    if (confirmEmailInput.trim().toLowerCase() !== deactivateTarget.email.toLowerCase()) {
      toast.error("Email address confirmation does not match");
      return;
    }

    try {
      await deactivateMutation.mutateAsync();
      setDeactivateTarget(null);
      setConfirmEmailInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to deactivate user";
      toast.error(msg);
    }
  };

  const columns: ColumnDef<User>[] = [
    {
      header: "User / Account",
      cell: (item: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8 rounded-full border">
            <AvatarImage src={item.avatar || undefined} />
            <AvatarFallback className="text-xs font-semibold uppercase bg-primary/10 text-primary">
              {item.name?.slice(0, 2) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-xs text-foreground truncate max-w-[160px]">
              {item.name}
              {currentAdmin?.id === item.id && (
                <span className="ml-1 text-[10px] text-primary font-normal">(You)</span>
              )}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[160px]">
              {item.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (item: User) => {
        const roleColors: Record<Role, string> = {
          ADMIN: "bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold",
          OWNER: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium",
          TENANT: "bg-blue-500/10 text-blue-600 border-blue-500/20 font-medium",
        };
        return (
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${roleColors[item.role]}`}>
            {item.role}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      cell: (item: User) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={item.isActive !== false ? "outline" : "destructive"}
            className="text-[10px]"
          >
            {item.isActive !== false ? "Active" : "Deactivated"}
          </Badge>
          {item.isVerified && (
            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Joined Date",
      cell: (item: User) => (
        <span className="text-xs font-mono text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      ),
    },
    {
      header: "",
      className: "text-right",
      cell: (item: User) => {
        const isSelf = currentAdmin?.id === item.id;
        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="xs"
              className="h-7 text-[11px]"
              onClick={() => handleOpenRoleModal(item)}
              disabled={isSelf}
              title={isSelf ? "Cannot modify your own administrative role" : "Change User Role"}
            >
              <Edit className="w-3.5 h-3.5 mr-1" />
              Role
            </Button>

            {item.isActive !== false && !isSelf && (
              <Button
                variant="ghost"
                size="xs"
                className="text-destructive hover:bg-destructive/10 h-7 text-[11px]"
                onClick={() => {
                  setDeactivateTarget(item);
                  setConfirmEmailInput("");
                }}
                title="Deactivate Account"
              >
                <UserX className="w-3.5 h-3.5 mr-1" />
                Deactivate
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const users = usersData?.data || [];
  const meta = usersData?.meta || { page, limit, total: users.length, totalPages: 1 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Access Management"
        description="Oversee user accounts, assign system roles (Admin, Owner, Tenant), and moderate account permissions."
      />

      {/* Filters Bar */}
      <Card className="bg-card/50">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={searchParam}
              onChange={(val) => updateParam("search", val)}
              placeholder="Search users by name, email..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={roleParam} onValueChange={(val) => updateParam("role", val || "ALL")}>
              <SelectTrigger className="w-[140px] text-xs h-9">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="TENANT">Tenant</SelectItem>
                <SelectItem value="OWNER">Owner / Host</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        keyExtractor={(item) => item.id}
        loading={isLoading}
        emptyTitle="No users found"
        emptyDescription="No registered users match your search criteria."
      />

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={handlePageChange}
          totalItems={meta.total}
          limit={meta.limit}
        />
      )}

      {/* Role Change Modal */}
      <Dialog open={!!roleChangeTarget} onOpenChange={(open) => !open && setRoleChangeTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Change User Role
            </DialogTitle>
            <DialogDescription className="text-xs">
              Assign a new system authorization level for {roleChangeTarget?.name} ({roleChangeTarget?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Select System Role</label>
              <Select
                value={selectedNewRole}
                onValueChange={(val) => setSelectedNewRole(val as Role)}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TENANT">TENANT - Search rooms, apply, pay leases</SelectItem>
                  <SelectItem value="OWNER">OWNER - List properties, manage rooms, issue bills</SelectItem>
                  <SelectItem value="ADMIN">ADMIN - Full platform moderation & telemetry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Impact Explanations */}
            <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Role impact summary:</span>
              {selectedNewRole === "ADMIN" && (
                <p>
                  Elevates user to Full Administrator with global moderation privileges and access to platform metrics.
                </p>
              )}
              {selectedNewRole === "OWNER" && (
                <p>
                  Permits user to list residential properties, configure room inventories, and issue rent/utility invoices.
                </p>
              )}
              {selectedNewRole === "TENANT" && (
                <p>
                  Standard renter account with room discovery, roommate compatibility profiles, and payment checkout.
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRoleChangeTarget(null)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleRoleChangeSubmit}
              disabled={updateRoleMutation.isPending || selectedNewRole === roleChangeTarget?.role}
            >
              {updateRoleMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Apply Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Dialog with Typed Confirmation */}
      <ConfirmDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title="Deactivate User Account?"
        description={`Deactivating ${deactivateTarget?.name}'s account will disable their active login sessions and suspend platform operations. Type their email below to confirm.`}
        confirmText="Deactivate Account"
        variant="destructive"
        isLoading={deactivateMutation.isPending}
        disabled={confirmEmailInput.trim().toLowerCase() !== deactivateTarget?.email.toLowerCase()}
        onConfirm={handleDeactivateConfirm}
      >
        <div className="space-y-1.5 pt-2 text-left">
          <label className="text-xs font-medium text-foreground">
            Type <span className="font-mono font-bold text-destructive">{deactivateTarget?.email}</span> to confirm:
          </label>
          <Input
            value={confirmEmailInput}
            onChange={(e) => setConfirmEmailInput(e.target.value)}
            placeholder={deactivateTarget?.email}
            className="text-xs font-mono"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
