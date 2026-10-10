import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users, Building2, CreditCard, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoorPlate } from "@/components/shared/DoorPlate";

import { getAppUrl } from "@/lib/utils";

const appUrl = getAppUrl();

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Nestly's mission to modernize co-living through verified room inventories, compatible roommate matching, and seamless online lease management.",
  openGraph: {
    title: "About Us | Nestly",
    description:
      "Learn about Nestly's mission to modernize co-living through verified room inventories, compatible roommate matching, and seamless online lease management.",
    url: `${appUrl}/about`,
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Banner */}
      <section className="py-16 lg:py-20 bg-muted/30 border-b border-border/50 text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-4">
          <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20">
            Our Purpose
          </Badge>
          <h1 className="h1-display font-bold text-foreground">
            Reimagining Co-Living for the Modern Resident
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Nestly was engineered to eliminate friction from shared residential living. We combine transparent room-level occupancy, lifestyle matching algorithms, and automated Stripe lease payments into one cohesive platform.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="h2-display font-bold text-foreground">Core Platform Pillars</h2>
            <p className="text-sm text-muted-foreground">
              The fundamental principles that guide every feature we develop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg">Transparent Leases</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every unit is broken down into specific DoorPlate room numbers with clear individual rent amounts, deposits, and occupancy limits. No hidden shared fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg">Lifestyle Compatibility</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We believe great homes begin with compatible housemates. Our matching engine factors in sleep habits, cleanliness, noise tolerance, and budget ranges.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-display font-bold text-lg">Seamless Financials</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automated monthly rent invoice generation, utility bill splitting among active roommates, and instant payment settlement powered by Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Motif Feature */}
      <section className="py-16 lg:py-20 bg-muted/20 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20">
                Signature Identifier
              </Badge>
              <h2 className="h2-display font-bold text-foreground">
                The Engraved Brass DoorPlate
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                In traditional rentals, shared spaces can feel chaotic and undefined. Nestly introduces room-level precision. Every private room is assigned a distinctive DoorPlate identifier across listings, lease contracts, and invoices.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <DoorPlate roomNumber="Suite 201" size="md" subtitle="Private Ensuite" />
                <DoorPlate roomNumber="Room B-4" size="md" subtitle="Corner Studio" />
              </div>
            </div>

            <div className="lg:col-span-6 p-8 rounded-2xl bg-card border border-border shadow-md space-y-4">
              <h3 className="font-display font-bold text-base">Platform Capabilities</h3>
              <ul className="space-y-3 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Real-time occupancy tracking (currentOccupancy / capacity)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Multi-step property creation wizard with draft persistence</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Kanban-style maintenance ticket resolution workflow</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Immutable audit logging for compliance and moderation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background text-center border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-xl space-y-4">
          <h2 className="h2-display font-bold">Ready to experience Nestly?</h2>
          <p className="text-sm text-muted-foreground">
            Explore our verified property listings or try our one-click demo accounts.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/properties" className={buttonVariants({ variant: "default" })}>
              Browse Properties
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline" })}>
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
