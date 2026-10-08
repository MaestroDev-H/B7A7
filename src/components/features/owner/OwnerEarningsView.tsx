"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  DollarSign,
  TrendingUp,
  Percent,
  KeyRound,
  Building2,
  Receipt,
  Info,
  AlertCircle,
} from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { MoneyText } from "@/components/shared/MoneyText";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMyProperties } from "@/hooks/use-properties";
import { useAllTenancies } from "@/hooks/use-tenancies";
import { tenanciesService } from "@/lib/api/services/tenancies";
import { clientFetch } from "@/lib/api/http.client";
import { queryKeys } from "@/lib/queries/keys";
import { formatMoney } from "@/lib/format";
import type { Invoice, Tenancy } from "@/lib/api/types";

// Dynamically import Recharts component with ssr: false
const EarningsCharts = dynamic(
  () => import("@/components/features/owner/EarningsCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 bg-muted/20 animate-pulse" />
        <Card className="h-80 bg-muted/20 animate-pulse" />
      </div>
    ),
  }
);

export function OwnerEarningsView() {
  const { data: properties = [], isLoading: propertiesLoading } = useMyProperties();
  const { data: allTenancies = [], isLoading: tenanciesLoading } = useAllTenancies();

  const activeTenancies = React.useMemo(
    () => allTenancies.filter((t) => t.status === "ACTIVE"),
    [allTenancies]
  );

  // Cap at 20 active tenancies for detailed invoice query
  const sampleTenancies = React.useMemo(
    () => activeTenancies.slice(0, 20),
    [activeTenancies]
  );

  const isCapped = activeTenancies.length > 20;

  // Query each tenancy details for invoices using useQueries
  const tenancyQueries = useQueries({
    queries: sampleTenancies.map((t) => ({
      queryKey: queryKeys.tenancies.detail(t.id),
      queryFn: () => tenanciesService.getById(clientFetch, t.id),
      staleTime: 60 * 1000,
    })),
  });

  const allSampleInvoices = React.useMemo(() => {
    const list: Invoice[] = [];
    tenancyQueries.forEach((q) => {
      if (q.data && Array.isArray(q.data.invoices)) {
        list.push(...q.data.invoices);
      }
    });
    return list;
  }, [tenancyQueries]);

  // Calculations
  const projectedMonthlyRent = React.useMemo(() => {
    return activeTenancies.reduce((acc, t) => {
      const rent = Number(t.room?.rentAmount || 0);
      return acc + (isNaN(rent) ? 0 : rent);
    }, 0);
  }, [activeTenancies]);

  const { totalRooms, occupiedRooms, occupancyRate } = React.useMemo(() => {
    let total = 0;
    let occupied = 0;
    properties.forEach((p) => {
      const rooms = p.rooms || [];
      total += rooms.length;
      occupied += rooms.filter((r) => r.status === "OCCUPIED" || r.currentOccupancy > 0).length;
    });
    const rate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { totalRooms: total, occupiedRooms: occupied, occupancyRate: rate };
  }, [properties]);

  const { totalCollected, totalPending, totalOverdue } = React.useMemo(() => {
    let collected = 0;
    let pending = 0;
    let overdue = 0;

    allSampleInvoices.forEach((inv) => {
      const amt = Number(inv.amount || 0);
      if (isNaN(amt)) return;

      if (inv.status === "PAID") {
        collected += amt;
      } else if (inv.status === "PENDING") {
        pending += amt;
      } else if (inv.status === "OVERDUE") {
        overdue += amt;
      }
    });

    return { totalCollected: collected, totalPending: pending, totalOverdue: overdue };
  }, [allSampleInvoices]);

  // Data for Charts
  const propertyOccupancyChartData = React.useMemo(() => {
    return properties.map((p) => {
      const rooms = p.rooms || [];
      const occ = rooms.filter((r) => r.status === "OCCUPIED" || r.currentOccupancy > 0).length;
      return {
        propertyName: p.title.length > 18 ? `${p.title.slice(0, 18)}...` : p.title,
        totalRooms: rooms.length,
        occupiedRooms: occ,
      };
    });
  }, [properties]);

  const invoiceBreakdownChartData = React.useMemo(() => {
    return [
      { name: "Collected (Paid)", value: totalCollected, color: "#10b981" },
      { name: "Pending", value: totalPending, color: "#3b82f6" },
      { name: "Overdue", value: totalOverdue, color: "#ef4444" },
    ];
  }, [totalCollected, totalPending, totalOverdue]);

  const isLoading = propertiesLoading || tenanciesLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial & Earnings Analytics"
        description="Comprehensive overview of projected revenue, invoice collections, and platform occupancy rates."
      />

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Projected Monthly Rent"
          value={formatMoney(projectedMonthlyRent)}
          icon={TrendingUp}
          description="Sum of all active lease monthly rents"
          loading={isLoading}
        />
        <StatCard
          label="Occupancy Rate"
          value={`${occupancyRate}%`}
          icon={Percent}
          description={`${occupiedRooms} of ${totalRooms} units occupied`}
          loading={isLoading}
        />
        <StatCard
          label="Active Tenancies"
          value={activeTenancies.length}
          icon={KeyRound}
          description={`${allTenancies.length} total leases all-time`}
          loading={isLoading}
        />
        <StatCard
          label="Collected to Date"
          value={formatMoney(totalCollected)}
          icon={DollarSign}
          description={
            isCapped
              ? "Based on your 20 most recent tenancies"
              : "Sum of paid rent & deposit invoices"
          }
          loading={isLoading}
        />
      </div>

      {isCapped && (
        <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-xl border text-xs text-muted-foreground">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span>
            Note: Collected metrics and invoice breakdown are computed based on your 20 most recent tenancies.
          </span>
        </div>
      )}

      {/* Charts Section */}
      <EarningsCharts
        occupancyData={propertyOccupancyChartData}
        invoicesData={invoiceBreakdownChartData}
      />
    </div>
  );
}
