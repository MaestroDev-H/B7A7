"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  Calendar,
  FileText,
  CreditCard,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  Users,
  Wrench,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMyTenancies, useMyInvoices } from "@/hooks/use-tenancies";
import { useMyViewings } from "@/hooks/use-viewings";
import { useMyApplications } from "@/hooks/use-applications";
import { useCurrentUser } from "@/hooks/use-users";
import { formatDate, formatDateTime } from "@/lib/format";

export function TenantOverview() {
  const { data: user } = useCurrentUser();
  const { data: tenancies = [], isLoading: loadingTenancies } = useMyTenancies();
  const { data: viewings = [], isLoading: loadingViewings } = useMyViewings();
  const { data: applications = [], isLoading: loadingApplications } = useMyApplications();
  const { data: invoices = [], isLoading: loadingInvoices } = useMyInvoices();

  const activeTenancies = tenancies.filter((t) => t.status === "ACTIVE");
  const pendingViewings = viewings.filter((v) => v.status === "PENDING");
  const pendingApplications = applications.filter((a) => a.status === "PENDING");

  const unpaidInvoices = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
  const totalUnpaidAmount = unpaidInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  // Nearest pending invoice
  const nextInvoiceDue = [...unpaidInvoices].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  const hasActivity =
    tenancies.length > 0 ||
    viewings.length > 0 ||
    applications.length > 0 ||
    invoices.length > 0;

  const isLoading = loadingTenancies || loadingViewings || loadingApplications || loadingInvoices;

  return (
    <div className="space-y-8">
      {/* Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-primary/20 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary text-xs font-semibold tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Tenant Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-display">
              Welcome back, {user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1 max-w-xl">
              Manage your room viewings, applications, rent payments, and roommate connections all in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button render={<Link href="/properties" />} size="sm" className="shadow-xs">
              <Search className="w-4 h-4 mr-1.5" />
              Find Rooms
            </Button>
            <Button render={<Link href="/dashboard/roommates" />} variant="outline" size="sm">
              <Users className="w-4 h-4 mr-1.5" />
              Find Roommates
            </Button>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Tenancies"
          value={activeTenancies.length}
          description={activeTenancies.length > 0 ? "Current living stay" : "No active tenancy"}
          icon={Home}
        />
        <StatCard
          label="Pending Viewings"
          value={pendingViewings.length}
          description={pendingViewings.length > 0 ? "Awaiting host confirmation" : "Up to date"}
          icon={Calendar}
        />
        <StatCard
          label="Pending Applications"
          value={pendingApplications.length}
          description={pendingApplications.length > 0 ? "Under host review" : "No open applications"}
          icon={FileText}
        />
        <StatCard
          label="Outstanding Invoices"
          value={<MoneyText amount={totalUnpaidAmount} />}
          description={
            unpaidInvoices.length > 0
              ? `${unpaidInvoices.length} invoice${unpaidInvoices.length > 1 ? "s" : ""} due`
              : "All invoices paid"
          }
          icon={CreditCard}
        />
      </div>

      {/* Next Payment Due Banner (if unpaid invoices exist) */}
      {nextInvoiceDue && (
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xs overflow-hidden">
          <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-foreground">
                    Next Payment Due: <MoneyText amount={nextInvoiceDue.amount} />
                  </h3>
                  <StatusBadge status={nextInvoiceDue.status} />
                  {new Date(nextInvoiceDue.dueDate) < new Date() && (
                    <span className="text-[11px] font-medium text-destructive px-2 py-0.5 rounded bg-destructive/10">
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Due on <span className="font-medium text-foreground">{formatDate(nextInvoiceDue.dueDate)}</span> • {nextInvoiceDue.description || `${nextInvoiceDue.type} invoice`}
                </p>
              </div>
            </div>

            <Button
              render={<Link href="/dashboard/invoices" />}
              variant="default"
              className="sm:self-center shrink-0 bg-primary hover:bg-primary/90 shadow-xs"
            >
              <CreditCard className="w-4 h-4 mr-1.5" />
              Review & Pay
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State Onboarding if user has 0 activity */}
      {!isLoading && !hasActivity ? (
        <Card className="border-dashed p-8">
          <EmptyState
            title="Start your rental journey"
            description="You haven't requested any viewings or submitted applications yet. Browse verified rooms across the city or match with compatible roommates."
            icon={Home}
            action={{
              label: "Explore Properties",
              href: "/properties",
            }}
            secondaryAction={{
              label: "Set Roommate Preferences",
              href: "/dashboard/roommates",
            }}
          />
        </Card>
      ) : (
        /* Activity Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Viewings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Viewing Requests</CardTitle>
                <CardDescription className="text-xs">Your scheduled and pending room viewings</CardDescription>
              </div>
              <Button render={<Link href="/dashboard/viewings" />} variant="ghost" size="xs">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {viewings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No viewing requests scheduled.</p>
              ) : (
                viewings.slice(0, 4).map((viewing) => (
                  <div
                    key={viewing.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/60 hover:bg-muted/40 transition-colors text-xs"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {viewing.room?.property?.title || viewing.property?.title || "Property Room"}
                        </span>
                        {viewing.room?.roomNumber && <DoorPlate roomNumber={viewing.room.roomNumber} size="sm" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span>{formatDateTime(viewing.requestedDate)}</span>
                      </div>
                    </div>
                    <StatusBadge status={viewing.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Rental Applications</CardTitle>
                <CardDescription className="text-xs">Track application approvals and move-in status</CardDescription>
              </div>
              <Button render={<Link href="/dashboard/applications" />} variant="ghost" size="xs">
                View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {applications.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No submitted applications yet.</p>
              ) : (
                applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/60 hover:bg-muted/40 transition-colors text-xs"
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {app.room?.property?.title || "Property Room"}
                        </span>
                        {app.room?.roomNumber && <DoorPlate roomNumber={app.room.roomNumber} size="sm" />}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
                        <span>Move-in: {formatDate(app.moveInDate)}</span>
                        {app.room?.rentAmount && (
                          <span>• <MoneyText amount={app.room.rentAmount} />/mo</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Access Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <Link
          href="/dashboard/roommates"
          className="p-4 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all flex flex-col items-center text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-foreground">Roommates</span>
          <span className="text-[11px] text-muted-foreground">Match with compatible peers</span>
        </Link>

        <Link
          href="/dashboard/tenancies"
          className="p-4 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all flex flex-col items-center text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-foreground">My Tenancies</span>
          <span className="text-[11px] text-muted-foreground">Active lease contracts</span>
        </Link>

        <Link
          href="/dashboard/invoices"
          className="p-4 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all flex flex-col items-center text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-foreground">Payments & Rent</span>
          <span className="text-[11px] text-muted-foreground">Stripe secure checkout</span>
        </Link>

        <Link
          href="/dashboard/maintenance"
          className="p-4 rounded-xl border bg-card hover:bg-muted/40 hover:border-primary/40 transition-all flex flex-col items-center text-center space-y-2 group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Wrench className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-foreground">Maintenance</span>
          <span className="text-[11px] text-muted-foreground">Submit repair tickets</span>
        </Link>
      </div>
    </div>
  );
}
