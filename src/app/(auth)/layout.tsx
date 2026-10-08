import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { Home, ShieldCheck, Users, Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground">
      {/* Left Brand Panel (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 bg-gradient-to-br from-primary via-[#162d24] to-[#0d1c16] text-[#f4fbf7] overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo & Header */}
        <div className="relative z-10 space-y-6">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Nestly
            </span>
          </Link>

          <div className="pt-8 space-y-3">
            <div className="inline-block mb-2">
              <DoorPlate roomNumber="Suite 101" size="md" subtitle="Boutique Co-living" />
            </div>
            <h1 className="h2-display text-white font-bold leading-tight">
              Where verified rooms meet compatible roommates.
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-md leading-relaxed">
              Step inside curated residences with clear transparent pricing, verified housemates, instant lease agreements, and effortless automated payments.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="relative z-10 space-y-4 my-8">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Lifestyle Matching</h4>
              <p className="text-[11px] text-emerald-100/70">
                Match by work habits, noise tolerance, cleanliness, and budget compatibility.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Verified Residences</h4>
              <p className="text-[11px] text-emerald-100/70">
                Every listing is verified by owners with room-level occupancy management.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="h-8 w-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Seamless Stripe Settlement</h4>
              <p className="text-[11px] text-emerald-100/70">
                Automated rent and utility invoice splitting with instant receipts.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-emerald-100/60 flex items-center justify-between border-t border-white/10 pt-4">
          <span>&copy; {new Date().getFullYear()} Nestly Living Inc.</span>
          <Link href="/faq" className="hover:text-white transition-colors underline-offset-4 hover:underline">
            Help & FAQs
          </Link>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="flex items-center justify-between pb-6">
          <Link href="/" className="lg:hidden inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Home className="h-4 w-4" />
            </div>
            <span className="font-display font-bold text-lg">Nestly</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="max-w-md w-full mx-auto my-auto py-6">
          {children}
        </div>

        <div className="text-center text-xs text-muted-foreground pt-6">
          Protected by industry standard encryption &middot;{" "}
          <Link href="/about" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
