import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, Building2, Bed } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { ImageFallback } from "@/components/shared/ImageFallback";
import { enumLabel } from "@/lib/format";
import type { Property } from "@/lib/api/types";

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const rooms = property.rooms || [];
  const availableRooms = rooms.filter((r) => r.status === "AVAILABLE");

  // Compute lowest rent among available rooms or all rooms
  const rents = rooms
    .map((r) => Number(r.rentAmount))
    .filter((n) => !isNaN(n) && n > 0);
  const minRent = rents.length > 0 ? Math.min(...rents) : null;

  const firstImage = property.images?.[0];

  return (
    <Card className={`group overflow-hidden rounded-xl border border-border/80 hover:border-primary/40 hover:shadow-md transition-all flex flex-col bg-card ${className || ""}`}>
      {/* Cover Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <ImageFallback className="h-full w-full rounded-none" />
        )}

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-foreground border-border/60 text-[11px] font-medium shadow-xs">
            {enumLabel(property.type)}
          </Badge>
        </div>

        {/* Available Rooms Chip */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-md bg-slate-900/80 text-emerald-400 border border-emerald-500/30 shadow-xs">
            <Bed className="h-3 w-3" />
            {availableRooms.length} {availableRooms.length === 1 ? "room" : "rooms"} available
          </span>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">
              {property.area ? `${property.area}, ` : ""}
              {property.city}
            </span>
          </div>

          {/* Title */}
          <Link href={`/properties/${property.id}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-display font-bold text-base line-clamp-1 leading-snug">
              {property.title}
            </h3>
          </Link>

          {/* Price Range */}
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-xs text-muted-foreground">From</span>
            {minRent !== null ? (
              <span className="font-display font-bold text-lg text-foreground">
                <MoneyText amount={minRent} />
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground italic">Contact for rent</span>
            )}
          </div>
        </div>

        {/* DoorPlate Room Chips */}
        {rooms.length > 0 && (
          <div className="pt-3 border-t border-border/60 flex items-center gap-2 overflow-hidden">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold shrink-0">
              Rooms:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {rooms.slice(0, 3).map((r) => (
                <div key={r.id} className="shrink-0">
                  <DoorPlate roomNumber={r.roomNumber} size="sm" />
                </div>
              ))}
              {rooms.length > 3 && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  +{rooms.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
