"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Users,
  Building,
  BedDouble,
  KeyRound,
  FileText,
  DollarSign,
  ShieldAlert,
  Info,
  Activity,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAdminStats, useAdminAuditLogs } from "@/hooks/use-admin";
import { formatMoney, formatDate } from "@/lib/format";

const AdminOverviewCharts = dynamic(
  () => import("@/components/features/admin/AdminOverviewCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-80 bg-muted/20 animate-pulse" />
          <Card className="h-80 bg-muted/20 animate-pulse" />
        </div>
        <Card className="h-64 bg-muted/20 animate-pulse" />
      </div>
    ),
  }
);

export function AdminOverviewView() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats();
  const { data: auditLogsData, isLoading: logsLoading } = useAdminAuditLogs({ limit: 100 });

  const totalUsers = stats?.totalUsers || 0;
  const totalOwners = stats?.totalOwners || 0;
  const totalTenants = stats?.totalTenants || 0;
  const totalAdmins = Math.max(0, totalUsers - totalOwners - totalTenants);

  // Users by Role Data
  const usersRoleData = React.useMemo(() => {
    return [
      { name: "Tenants", value: totalTenants, color: "#3b82f6" },
      { name: "Property Hosts", value: totalOwners, color: "#10b981" },
      { name: "Administrators", value: totalAdmins, color: "#8b5cf6" },
    ];
  }, [totalTenants, totalOwners, totalAdmins]);

  // Platform Inventory Data
  const inventoryData = React.useMemo(() => {
    return [
      { category: "Properties", count: stats?.totalProperties || 0 },
      { category: "Rooms", count: stats?.totalRooms || 0 },
      { category: "Active Leases", count: stats?.activeTenancies || 0 },
      { category: "Pending Apps", count: stats?.pendingApplications || 0 },
    ];
  }, [stats]);

  // Group recent 100 logs by day
  const activityTimelineData = React.useMemo(() => {
    const logs = auditLogsData?.data || [];
    const dayMap = new Map<string, number>();

    logs.forEach((log) => {
      const day = formatDate(log.createdAt);
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([date, actions]) => ({ date, actions }))
      .reverse();
  }, [auditLogsData]);

  if (statsError) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 border border-destructive/20 rounded-xl bg-destructive/5">
        <ShieldAlert className="w-8 h-8 text-destructive mx-auto" />
        <h3 className="font-bold text-base text-foreground">Failed to load system metrics</h3>
        <p className="text-xs text-muted-foreground">
          An error occurred while communicating with the administrative data endpoints.
        </p>
        <Button onClick={() => refetchStats()} size="sm">
          Retry Metrics
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Administration Console"
        description="Global system telemetry, user role distributions, property moderation, and ecosystem financials."
        actions={
          <div className="flex items-center gap-2">
            <Button render={<Link href="/admin/audit-logs" />} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-1.5" /> View Audit Trail
            </Button>
          </div>
        }
      />

      {/* KPI Stats Grid (8 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Registered Users"
          value={totalUsers}
          icon={Users}
          description={`${totalTenants} tenants • ${totalOwners} owners`}
          loading={statsLoading}
        />
        <StatCard
          label="Total Properties"
          value={stats?.totalProperties ?? 0}
          icon={Building}
          description="Residential buildings listed"
          loading={statsLoading}
        />
        <StatCard
          label="Total Room Units"
          value={stats?.totalRooms ?? 0}
          icon={BedDouble}
          description="Ecosystem unit inventory"
          loading={statsLoading}
        />
        <StatCard
          label="Total Revenue Collected"
          value={formatMoney(Number(stats?.totalRevenue || 0))}
          icon={DollarSign}
          description="All-time processed payments"
          loading={statsLoading}
        />
        <StatCard
          label="Active Tenancies"
          value={stats?.activeTenancies ?? 0}
          icon={KeyRound}
          description="Current occupied resident leases"
          loading={statsLoading}
        />
        <StatCard
          label="Pending Applications"
          value={stats?.pendingApplications ?? 0}
          icon={FileText}
          description="Awaiting landlord approval"
          loading={statsLoading}
        />
        <StatCard
          label="Property Hosts"
          value={totalOwners}
          icon={Building}
          description="Verified hosting accounts"
          loading={statsLoading}
        />
        <StatCard
          label="Active Renters"
          value={totalTenants}
          icon={Users}
          description="Registered tenant profiles"
          loading={statsLoading}
        />
      </div>

      {/* Note on data */}
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-primary shrink-0" />
        <span>
          Live Telemetry: All dashboard charts reflect current real-time database totals and the latest 100 audit entries.
        </span>
      </div>

      {/* Interactive Recharts */}
      <AdminOverviewCharts
        usersRoleData={usersRoleData}
        inventoryData={inventoryData}
        activityData={activityTimelineData}
      />
    </div>
  );
}
