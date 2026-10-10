import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import {
  Search,
  Users,
  ShieldCheck,
  CreditCard,
  Building2,
  Sparkles,
  ArrowRight,
  CalendarCheck,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { PropertyCard } from "@/components/features/properties/PropertyCard";
import { HeroSearch } from "@/components/features/home/HeroSearch";
import type { Property, Paginated } from "@/lib/api/types";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://b7-a7.vercel.app";

export const metadata: Metadata = {
  title: {
    absolute: "Nestly | Co-Living, Verified Rooms & Roommate Matching",
  },
  description:
    "Discover boutique co-living spaces, verified private rooms, and compatible housemates. Schedule tours, submit lease applications, and split rent seamlessly with Stripe.",
  openGraph: {
    title: "Nestly | Co-Living & Roommate Platform",
    description:
      "Find verified rooms with transparent pricing, compatible housemates, and automated lease billing.",
    url: appUrl,
    siteName: "Nestly",
    type: "website",
  },
};

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

async function getFeaturedProperties(): Promise<{ properties: Property[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/properties?limit=6`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { properties: [], total: 0 };
    const json: { success: boolean; data: Property[]; meta?: { total: number } } =
      await res.json();
    return {
      properties: Array.isArray(json.data) ? json.data : [],
      total: json.meta?.total || (Array.isArray(json.data) ? json.data.length : 0),
    };
  } catch {
    return { properties: [], total: 0 };
  }
}

export default async function HomePage() {
  const { properties, total } = await getFeaturedProperties();

  // JSON-LD Organization Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Nestly Co-Living",
    description: "Modern co-living platform with room-level leasing and roommate matching.",
    url: appUrl,
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card, Stripe",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background pt-12 pb-20 lg:pt-20 lg:pb-32 border-b border-border/50">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* DoorPlate Signature Element */}
              <div className="inline-flex items-center gap-3">
                <DoorPlate roomNumber="Suite 101" size="md" subtitle="Curated Residences" />
                <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 py-1">
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                  Verified Community
                </Badge>
              </div>

              <h1 className="h1-display font-bold tracking-tight text-foreground leading-tight">
                Where verified rooms meet compatible roommates.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Step inside boutique co-living spaces with transparent room-level pricing, scheduled viewings, verified housemates, and effortless Stripe rent settlement.
              </p>

              {/* Interactive Search Island */}
              <div className="pt-2 flex justify-center lg:justify-start">
                <HeroSearch />
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  No Hidden Broker Fees
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Automated Stripe Checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Lifestyle Compatibility Score
                </span>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-card">
                <div className="relative aspect-4/3 w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
                    alt="Bright modern boutique living room interior with contemporary furniture"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Overlay Card Info */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-background/90 backdrop-blur-md border border-border/80 shadow-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">Mission Bay Residence</p>
                    <p className="text-[11px] text-muted-foreground">San Francisco, CA &middot; 3 Rooms</p>
                  </div>
                  <DoorPlate roomNumber="Room B-2" size="sm" />
                </div>
              </div>

              {/* Floating Match Pill */}
              <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 p-3 rounded-xl bg-card border border-border shadow-xl">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs">
                  94%
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold">Roommate Match</p>
                  <p className="text-[10px] text-muted-foreground">Early riser &middot; Non-smoker</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-2 text-xs font-medium text-primary border-primary/20">
                Curated Spaces
              </Badge>
              <h2 className="h2-display font-bold text-foreground">Featured Properties</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Explore residences available for immediate viewing and reservation.
              </p>
            </div>
            <Link
              href="/properties"
              className={buttonVariants({ variant: "outline", className: "self-start md:self-auto text-xs font-semibold" })}
            >
              View All Properties
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed rounded-2xl bg-muted/20 space-y-3">
              <Building2 className="h-10 w-10 mx-auto text-muted-foreground/60" />
              <h3 className="font-display font-semibold text-base">New properties joining soon</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Our property hosts are currently updating room listings and schedules. Check back shortly or browse all properties.
              </p>
              <Link href="/properties" className={buttonVariants({ variant: "default", size: "sm" })}>
                Browse Listings
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How Nestly Works - 4 Steps */}
      <section className="py-16 lg:py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20">
              Simple Journey
            </Badge>
            <h2 className="h2-display font-bold text-foreground">How Nestly Works</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From discovering your private room to signing lease agreements and paying rent, everything happens transparently online.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg">
                1
              </div>
              <h3 className="font-display font-bold text-base">Search &amp; Filter Rooms</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter by city, room type, rent budget, and amenities with real-time occupancy and DoorPlate keys.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg">
                2
              </div>
              <h3 className="font-display font-bold text-base">Book a Viewing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select your preferred tour date and time. Property owners confirm or suggest alternatives in 1-click.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg">
                3
              </div>
              <h3 className="font-display font-bold text-base">Apply &amp; Lease Online</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Submit your rental application with intended move-in date. Approval instantly creates your tenancy record.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-2xl bg-card border border-border shadow-xs space-y-4 relative">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg">
                4
              </div>
              <h3 className="font-display font-bold text-base">Settle Rent via Stripe</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pay security deposits and monthly rent invoices safely through Stripe with instant status confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roommate Matching Explainer */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Box */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-muted to-card border border-border shadow-md space-y-6">
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                      JD
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Jane Doe</h4>
                      <p className="text-xs text-muted-foreground">San Francisco &middot; Budget $1,200 - $1,800</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500 text-white font-mono text-xs">96% Match</Badge>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Shared Lifestyle Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs bg-background border border-border text-foreground font-medium">
                      🌿 Non-smoker
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs bg-background border border-border text-foreground font-medium">
                      ☀️ Early riser
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs bg-background border border-border text-foreground font-medium">
                      💻 Remote worker
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-xs bg-background border border-border text-foreground font-medium">
                      🐱 Pet friendly
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background/80 border border-border text-xs text-muted-foreground flex items-center justify-between">
                  <span>Room Preference: Private Ensuite</span>
                  <DoorPlate roomNumber="Room 302" size="sm" />
                </div>
              </div>
            </div>

            {/* Explanation Content */}
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="outline" className="text-xs font-medium text-primary border-primary/20">
                Compatibility Engine
              </Badge>
              <h2 className="h2-display font-bold text-foreground">
                Live with housemates who match your lifestyle rhythm.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Shared living works best when daily habits align. Nestly calculates compatibility scores across budget ranges, sleep schedules, cleanliness standards, and work patterns before you sign a lease.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Dynamic Tag Matching</h4>
                    <p className="text-xs text-muted-foreground">Match with tenants looking for similar house vibes and noise preferences.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground">Matching Room Recommendations</h4>
                    <p className="text-xs text-muted-foreground">Discover available units in properties where compatible housemates already live.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/register" className={buttonVariants({ variant: "default" })}>
                  Set Your Preferences
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Specific Value Blocks */}
      <section className="py-16 lg:py-24 bg-muted/20 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="h2-display font-bold text-foreground">Built for Tenants &amp; Property Hosts</h2>
            <p className="text-sm text-muted-foreground">
              Dedicated tools and interfaces tailored to your role in the residential journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tenant Value Block */}
            <div className="p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">For Room Seekers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Browse verified listings, schedule tours, apply in minutes, find compatible housemates, and pay rent online with automated invoices.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">&bull; Individual room leases with exact keys</li>
                  <li className="flex items-center gap-2">&bull; Stripe test payment receipts &amp; history</li>
                  <li className="flex items-center gap-2">&bull; Maintenance request submission with photos</li>
                </ul>
              </div>
              <Link href="/register" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto self-start" })}>
                Find a Room &rarr;
              </Link>
            </div>

            {/* Owner Value Block */}
            <div className="p-8 rounded-2xl bg-card border border-border shadow-xs space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-foreground">For Property Hosts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  5-step listing wizard, room-level occupancy management, incoming viewing &amp; application approvals, automated invoice splitting, and maintenance Kanban.
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                  <li className="flex items-center gap-2">&bull; Multi-room configuration with custom pricing</li>
                  <li className="flex items-center gap-2">&bull; Utility bill splitting among active roommates</li>
                  <li className="flex items-center gap-2">&bull; Real-time occupancy &amp; earnings analytics</li>
                </ul>
              </div>
              <Link href="/register" className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto self-start" })}>
                List Your Property &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Platform Stats */}
      {total > 0 && (
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <p className="font-display font-bold text-3xl sm:text-4xl text-white">{total}</p>
                <p className="text-xs text-emerald-100/80 uppercase tracking-wider">Properties Listed</p>
              </div>
              <div className="space-y-1">
                <p className="font-display font-bold text-3xl sm:text-4xl text-white">100%</p>
                <p className="text-xs text-emerald-100/80 uppercase tracking-wider">Verified Hosts</p>
              </div>
              <div className="space-y-1">
                <p className="font-display font-bold text-3xl sm:text-4xl text-white">24/7</p>
                <p className="text-xs text-emerald-100/80 uppercase tracking-wider">Maintenance Support</p>
              </div>
              <div className="space-y-1">
                <p className="font-display font-bold text-3xl sm:text-4xl text-white">Instant</p>
                <p className="text-xs text-emerald-100/80 uppercase tracking-wider">Stripe Settlement</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Band */}
      <section className="py-16 lg:py-20 bg-background text-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
          <div className="inline-block">
            <DoorPlate roomNumber="Unit 500" size="md" subtitle="Move In Today" />
          </div>
          <h2 className="h2-display font-bold text-foreground">
            Ready to find your ideal room or list your space?
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join hundreds of satisfied residents and property hosts on Nestly today. Create an account or try our 1-click demo logins.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/properties" className={buttonVariants({ variant: "default", size: "lg", className: "w-full sm:w-auto" })}>
              <Search className="mr-2 h-4 w-4" />
              Explore Properties
            </Link>
            <Link href="/login" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}>
              <KeyRound className="mr-2 h-4 w-4" />
              Try Demo Accounts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
