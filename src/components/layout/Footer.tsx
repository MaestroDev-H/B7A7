import * as React from "react";
import Link from "next/link";
import { Home, Mail, MapPin, ShieldCheck } from "lucide-react";
import { DoorPlate } from "@/components/shared/DoorPlate";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                <Home className="h-4.5 w-4.5" />
              </div>
              <span className="font-display text-xl font-bold tracking-tight">Nestly</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Nestly transforms shared living with verified co-living properties, room-level occupancy management, compatible roommate matching, and automated Stripe rent settlement.
            </p>
            <div className="pt-2">
              <DoorPlate roomNumber="Unit 204" size="sm" subtitle="Verified Community" />
            </div>
          </div>

          {/* Discovery */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Discover
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/properties" className="hover:text-primary transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-primary transition-colors">
                  Available Rooms
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary transition-colors">
                  Platform Services
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition-colors">
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Nestly
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  Help &amp; FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition-colors">
                  Member Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Direct Contact
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>San Francisco, CA &middot; New York, NY</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <a href="mailto:support@nestlyliving.com" className="hover:underline">
                  support@nestlyliving.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Verified SSL &amp; Stripe Test Safe</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nestly Living Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/about" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/faq" className="hover:underline">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
