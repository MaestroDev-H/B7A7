import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  ShieldCheck,
  User,
  Phone,
  Bed,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { ImageGallery } from "@/components/features/properties/ImageGallery";
import { PropertyActions } from "@/components/features/properties/PropertyActions";
import { RoomCard } from "@/components/features/rooms/RoomCard";
import { enumLabel } from "@/lib/format";
import type { Property } from "@/lib/api/types";

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

async function getPropertyById(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json: { success: boolean; data: Property } = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    return {
      title: "Property Not Found | Nestly",
    };
  }

  const ogImage = property.images?.[0] || undefined;

  return {
    title: `${property.title} | Nestly`,
    description: `${property.type} in ${property.city} - ${property.rooms?.length || 0} rooms with verified occupancy and online leasing.`,
    openGraph: {
      title: `${property.title} | Nestly Living`,
      description: property.description,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  const rooms = property.rooms || [];
  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-6xl">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/properties"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              All Properties
            </Link>
            <span className="text-border">/</span>
            <Badge variant="outline" className="text-[11px] font-medium">
              {enumLabel(property.type)}
            </Badge>
          </div>

          <h1 className="h1-display font-bold text-2xl sm:text-3xl text-foreground">
            {property.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>
              {property.address}, {property.area ? `${property.area}, ` : ""}
              {property.city}
            </span>
          </div>
        </div>

        {/* Role-Aware Actions Top */}
        <div className="shrink-0 self-start md:self-center">
          <PropertyActions property={property} />
        </div>
      </div>

      {/* Main Grid: Visuals & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery + Description + Amenities */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery Island */}
          <ImageGallery images={property.images} title={property.title} />

          {/* Description */}
          <div className="space-y-3 pt-2">
            <h2 className="font-display font-bold text-lg text-foreground">
              About this Residence
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities Chips */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="font-display font-bold text-base text-foreground">
                Included Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-muted/60 border border-border text-foreground font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Room Units Section */}
          <div id="rooms-section" className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-foreground">
                  Available Rooms &amp; Floorplans
                </h2>
                <p className="text-xs text-muted-foreground">
                  Select a room below to request a viewing or submit an online application.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {availableRooms.length} of {rooms.length} available
              </Badge>
            </div>

            {rooms.length > 0 ? (
              <div className="space-y-3">
                {rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    propertyTitle={property.title}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed rounded-xl bg-muted/20 text-xs text-muted-foreground">
                No rooms currently configured for this listing.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Host Card & Security Guarantee */}
        <div className="lg:col-span-4 space-y-6">
          {/* Host Card */}
          <Card className="rounded-2xl border border-border shadow-xs overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {property.owner?.name
                    ? property.owner.name.slice(0, 2).toUpperCase()
                    : "PH"}
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-muted-foreground font-medium block">
                    Property Host
                  </span>
                  <h4 className="font-semibold text-sm truncate text-foreground">
                    {property.owner?.name || "Verified Host"}
                  </h4>
                </div>
              </div>

              {property.owner?.phone && (
                <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  <span>{property.owner.phone}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border/60 text-xs text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Total Rooms</span>
                  <span className="font-semibold text-foreground font-mono">
                    {rooms.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Available Units</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                    {availableRooms.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nestly Verified Guarantee */}
          <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Nestly Verified Guarantee</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
              <li>&bull; Verified physical DoorPlate room keys</li>
              <li>&bull; Safe Stripe payment deposit escrow</li>
              <li>&bull; 24/7 emergency maintenance request system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
