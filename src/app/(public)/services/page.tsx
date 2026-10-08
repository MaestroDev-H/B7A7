import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  UserCheck,
  Building2,
  Shield,
  Eye,
  FileCheck,
  CreditCard,
  Wrench,
  TrendingUp,
  History,
  DoorClosed,
  CheckCircle2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Platform Services & Capabilities | Nestly",
  description:
    "Explore the comprehensive suite of services provided by Nestly for tenants, property owners, and platform administrators.",
};

export default function ServicesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20 bg-muted/30 border-b border-border/50 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-4">
          <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20">
            End-to-End Suite
          </Badge>
          <h1 className="h1-display font-bold text-foreground">
            Complete Services for Every Resident &amp; Host
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            From initial room discovery to lease completion, Nestly provides dedicated digital workflows for all three platform roles.
          </p>
        </div>
      </section>

      {/* Role Services Grid */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Tenant Services */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="h2-display font-bold text-foreground">Tenant Services</h2>
                <p className="text-xs text-muted-foreground">Everything you need to find, lease, and thrive in your shared home.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <Eye className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold text-base">Guided Viewings</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Request in-person or virtual property viewings with custom date &amp; time slots. Receive direct status updates from property hosts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold text-base">Instant Online Leases</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Submit rental applications with intended move-in dates. Approved applications automatically generate lease contracts and deposit invoices.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-display font-bold text-base">Stripe Invoicing &amp; Payments</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Pay security deposits and monthly rent via Stripe Checkout with automatic receipt logging, overdue tracking, and webhook polling.
                </p>
              </div>
            </div>
          </div>

          {/* Owner Services */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="h2-display font-bold text-foreground">Property Host Services</h2>
                <p className="text-xs text-muted-foreground">Professional property and room-level management tools.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <DoorClosed className="h-5 w-5 text-amber-500" />
                <h3 className="font-display font-bold text-base">5-Step Listing Wizard</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Configure residences, multiple rooms, individual rent and deposits, and photos with draft storage and sequential room publishing.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <Wrench className="h-5 w-5 text-amber-500" />
                <h3 className="font-display font-bold text-base">Maintenance Kanban Board</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track repair requests across OPEN, IN_PROGRESS, RESOLVED, and CLOSED columns with priority levels and photo attachments.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <TrendingUp className="h-5 w-5 text-amber-500" />
                <h3 className="font-display font-bold text-base">Earnings &amp; Occupancy Analytics</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Calculate projected monthly revenue, occupancy ratios, and collected rent across tenancies with interactive charts.
                </p>
              </div>
            </div>
          </div>

          {/* Admin Services */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="h2-display font-bold text-foreground">Platform Administration</h2>
                <p className="text-xs text-muted-foreground">Oversight, moderation, user roles, and compliance tracking.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="font-display font-bold text-base">User &amp; Role Management</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Elevate or switch user roles, review verification status, and deactivate accounts with full audit tracking.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <FileCheck className="h-5 w-5 text-blue-500" />
                <h3 className="font-display font-bold text-base">Listing Moderation</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Review and unpublish listings violating platform terms, inspect room structures, and maintain catalog quality.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-3">
                <History className="h-5 w-5 text-blue-500" />
                <h3 className="font-display font-bold text-base">Audit Trail &amp; CSV Export</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Query tamper-proof system logs of all operations, inspect full JSON metadata payloads, and export for external reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/20 text-center border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl space-y-4">
          <h2 className="h2-display font-bold">Ready to get started?</h2>
          <p className="text-sm text-muted-foreground">
            Create an account today and experience modern co-living management.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/register" className={buttonVariants({ variant: "default" })}>
              Sign Up Now
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
