"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  BedDouble,
  FileText,
  Wrench,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  Clock,
  CheckCircle2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMyProperties } from "@/hooks/use-properties";
import { useIncomingApplications } from "@/hooks/use-applications";
import { useIncomingViewings } from "@/hooks/use-viewings";
import { useIncomingMaintenanceRequests } from "@/hooks/use-maintenance";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatDateTime } from "@/lib/format";

export function OwnerOverview() {
  const { user } = useAuth();

  const { data: properties = [], isLoading: propertiesLoading } = useMyProperties();
  const { data: applications = [], isLoading: applicationsLoading } = useIncomingApplications();
  const { data: viewings = [], isLoading: viewingsLoading } = useIncomingViewings();
  const { data: maintenance = [], isLoading: maintenanceLoading } = useIncomingMaintenanceRequests();

  // Aggregate stats
  const { totalRooms, availableRooms, occupiedRooms } = React.useMemo(() => {
    let total = 0;
    let available = 0;
    let occupied = 0;

    properties.forEach((p) => {
      const rooms = p.rooms || [];
      total += rooms.length;
      rooms.forEach((r) => {
        if (r.status === "AVAILABLE") available++;
        else if (r.status === "OCCUPIED" || r.currentOccupancy > 0) occupied++;
      });
    });

    return { totalRooms: total, availableRooms: available, occupiedRooms: occupied };
  }, [properties]);

  const pendingApplications = React.useMemo(
    () => applications.filter((a) => a.status === "PENDING"),
    [applications]
  );

  const pendingViewings = React.useMemo(
    () => viewings.filter((v) => v.status === "PENDING"),
    [viewings]
  );

  const openMaintenance = React.useMemo(
    () => maintenance.filter((m) => m.status === "OPEN" || m.status === "IN_PROGRESS"),
    [maintenance]
  );

  const urgentMaintenance = React.useMemo(
    () => maintenance.filter((m) => m.priority === "URGENT" && m.status !== "RESOLVED" && m.status !== "CLOSED"),
    [maintenance]
  );

  const isLoading =
    propertiesLoading || applicationsLoading || viewingsLoading || maintenanceLoading;

  const needsAttentionCount =
    pendingApplications.length + pendingViewings.length + openMaintenance.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Host"}`}
        description="Here is your real-time property management hub, pending renter requests, and unit occupancies."
        actions={
          <div className="flex items-center gap-2">
            <Button render={<Link href="/owner/properties/new" />} size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> List New Property
            </Button>
          </div>
        }
      />

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Listed Properties"
          value={properties.length}
          icon={Building2}
          description={`${properties.filter((p) => p.isPublished).length} published online`}
          loading={isLoading}
        />
        <StatCard
          label="Available Units"
          value={availableRooms}
          icon={BedDouble}
          description={`${occupiedRooms} of ${totalRooms} units occupied`}
          loading={isLoading}
        />
        <StatCard
          label="Pending Applications"
          value={pendingApplications.length}
          icon={FileText}
          description={`${applications.length} total applications`}
          loading={isLoading}
        />
        <StatCard
          label="Open Repairs"
          value={openMaintenance.length}
          icon={Wrench}
          description={urgentMaintenance.length > 0 ? `${urgentMaintenance.length} marked URGENT` : "All normal priority"}
          loading={isLoading}
        />
      </div>

      {/* Needs Attention Alert Box */}
      {needsAttentionCount > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <CardTitle className="text-sm font-semibold text-foreground">
                  Needs Your Attention ({needsAttentionCount})
                </CardTitle>
              </div>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                Action required
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Pending Applications Box */}
              {pendingApplications.length > 0 && (
                <Link
                  href="/owner/applications?status=PENDING"
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary transition-all text-xs group"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      {pendingApplications.length} Pending Application{pendingApplications.length > 1 ? "s" : ""}
                    </span>
                    <p className="text-[11px] text-muted-foreground">Review lease applicants</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* Pending Viewings Box */}
              {pendingViewings.length > 0 && (
                <Link
                  href="/owner/viewings?status=PENDING"
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary transition-all text-xs group"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {pendingViewings.length} Tour Request{pendingViewings.length > 1 ? "s" : ""}
                    </span>
                    <p className="text-[11px] text-muted-foreground">Confirm viewing schedules</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}

              {/* Open Repairs Box */}
              {openMaintenance.length > 0 && (
                <Link
                  href="/owner/maintenance"
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary transition-all text-xs group"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-primary" />
                      {openMaintenance.length} Open Ticket{openMaintenance.length > 1 ? "s" : ""}
                    </span>
                    <p className="text-[11px] text-muted-foreground">Manage repairs & dispatch</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>You&apos;re all caught up! No pending applications, viewing requests, or open repairs requiring urgent response.</span>
        </div>
      )}

      {/* Two Column Section: Recent Applications & Recent Properties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Applications</CardTitle>
              <CardDescription className="text-xs">Latest submissions from renters.</CardDescription>
            </div>
            <Button render={<Link href="/owner/applications" />} variant="ghost" size="xs">
              View all <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No applications received yet.</p>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{app.tenant?.name || "Renter"}</span>
                      {app.room?.roomNumber && <DoorPlate roomNumber={app.room.roomNumber} size="sm" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {app.room?.property?.title || "Property"} • Move-in {formatDate(app.moveInDate)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* My Properties Quick View */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold">Your Properties</CardTitle>
              <CardDescription className="text-xs">Real-time status of your active listings.</CardDescription>
            </div>
            <Button render={<Link href="/owner/properties" />} variant="ghost" size="xs">
              Manage <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {properties.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-muted-foreground">You haven&apos;t listed any properties yet.</p>
                <Button render={<Link href="/owner/properties/new" />} size="xs">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Your First Listing
                </Button>
              </div>
            ) : (
              properties.slice(0, 4).map((prop) => {
                const rooms = prop.rooms || [];
                const occupied = rooms.filter((r) => r.status === "OCCUPIED" || r.currentOccupancy > 0).length;
                return (
                  <Link
                    key={prop.id}
                    href={`/owner/properties/${prop.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary transition-all text-xs group"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[200px]">
                          {prop.title}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            prop.isPublished
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {prop.isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {prop.city} • {occupied} / {rooms.length} Units Occupied
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
