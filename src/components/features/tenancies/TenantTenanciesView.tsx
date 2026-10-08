"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Calendar, CreditCard, ArrowRight, Building2, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyTenancies, useMyInvoices } from "@/hooks/use-tenancies";
import { formatDate } from "@/lib/format";
import type { Tenancy } from "@/lib/api/types";

export function TenantTenanciesView() {
  const { data: tenancies = [], isLoading } = useMyTenancies();
  const { data: invoices = [] } = useMyInvoices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tenancies"
        description="View your active leases, contract periods, rental agreements, and payment schedules."
        actions={
          <Button render={<Link href="/properties" />} size="sm">
            <Home className="w-4 h-4 mr-1.5" />
            Explore Properties
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse h-48 bg-muted/40" />
          ))}
        </div>
      ) : tenancies.length === 0 ? (
        <Card className="p-8 border-dashed">
          <EmptyState
            title="No tenancies found"
            description="You do not currently have any active or past tenancy agreements. Once a host approves your rental application, your tenancy will appear here."
            icon={Home}
            action={{
              label: "Browse Available Rooms",
              href: "/properties",
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tenancies.map((tenancy: Tenancy) => {
            const property = tenancy.room?.property;
            const tenancyInvoices = invoices.filter((i) => i.tenancyId === tenancy.id);
            const unpaidInvoices = tenancyInvoices.filter(
              (i) => i.status === "PENDING" || i.status === "OVERDUE"
            );

            return (
              <Card
                key={tenancy.id}
                className="overflow-hidden border hover:border-primary/40 transition-all shadow-2xs group"
              >
                <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between gap-3 border-b bg-muted/20">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-base truncate font-display">
                        {property?.title || "Property Stay"}
                      </h3>
                      {tenancy.room?.roomNumber && (
                        <DoorPlate roomNumber={tenancy.room.roomNumber} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {property?.city ? `${property.address}, ${property.city}` : "Address not available"}
                    </p>
                  </div>
                  <StatusBadge status={tenancy.status} />
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3 py-1">
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-[11px]">Monthly Rent</span>
                      <div className="font-semibold text-foreground text-sm">
                        <MoneyText amount={tenancy.rentAmount} />
                        <span className="text-[11px] font-normal text-muted-foreground">/mo</span>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-[11px]">Security Deposit</span>
                      <div className="font-semibold text-foreground text-sm">
                        <MoneyText amount={tenancy.depositAmount} />
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-[11px]">Lease Start</span>
                      <div className="font-medium text-foreground flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                        {formatDate(tenancy.startDate)}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-muted-foreground text-[11px]">Lease End</span>
                      <div className="font-medium text-foreground flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-muted-foreground shrink-0" />
                        {tenancy.endDate ? formatDate(tenancy.endDate) : "Ongoing"}
                      </div>
                    </div>
                  </div>

                  {/* Outstanding invoices banner if any */}
                  {unpaidInvoices.length > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length > 1 ? "s" : ""}
                      </span>
                      <Link href="/dashboard/invoices" className="underline font-semibold hover:opacity-80">
                        Pay now
                      </Link>
                    </div>
                  )}

                  <div className="flex items-center justify-end pt-2 border-t">
                    <Button
                      render={<Link href={`/dashboard/tenancies/${tenancy.id}`} />}
                      variant="outline"
                      size="xs"
                      className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                    >
                      Tenancy Details & Invoices
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
