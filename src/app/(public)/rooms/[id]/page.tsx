import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  Bed,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Calendar,
  DollarSign,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { RoomCard } from "@/components/features/rooms/RoomCard";
import type { Room } from "@/lib/api/types";

const API_BASE_URL = (
  process.env.API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

async function getRoomById(id: string): Promise<Room | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json: { success: boolean; data: Room } = await res.json();
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
  const room = await getRoomById(id);

  if (!room) {
    return { title: "Room Not Found" };
  }

  return {
    title: `Room ${room.roomNumber} - ${room.property?.title || "Residential Property"}`,
    description: `Rent Room ${room.roomNumber} for $${room.rentAmount}/mo with verified DoorPlate key and instant online application.`,
  };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) {
    notFound();
  }

  const property = room.property;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-4xl">
      {/* Header Back Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border pb-4">
        <Link href="/rooms" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          All Rooms
        </Link>
        {property && (
          <>
            <span className="text-border">/</span>
            <Link href={`/properties/${property.id}`} className="hover:text-foreground truncate">
              {property.title}
            </Link>
          </>
        )}
        <span className="text-border">/</span>
        <span className="font-semibold text-foreground">Room {room.roomNumber}</span>
      </div>

      {/* Main Room Card */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <DoorPlate roomNumber={room.roomNumber} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="h1-display font-bold text-2xl text-foreground">
                  Room {room.roomNumber}
                </h1>
                <StatusBadge status={room.status} />
              </div>
              {property && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {property.address}, {property.city}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Room Interactive Actions Card */}
        <RoomCard
          room={room}
          propertyTitle={property?.title || "Residential Property"}
        />

        {/* Detailed Breakdown Card */}
        <Card className="rounded-2xl border border-border shadow-xs">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-display font-bold text-base text-foreground">
              Lease Terms &amp; Financials
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px] block">Monthly Rent</span>
                <span className="font-bold text-sm text-foreground font-display">
                  <MoneyText amount={Number(room.rentAmount)} />
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px] block">Security Deposit</span>
                <span className="font-bold text-sm text-foreground font-display">
                  <MoneyText amount={Number(room.depositAmount)} />
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px] block">Room Capacity</span>
                <span className="font-bold text-sm text-foreground font-mono">
                  {room.capacity} {room.capacity === 1 ? "resident" : "residents"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <span className="text-muted-foreground text-[11px] block">Current Occupancy</span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                  {room.currentOccupancy} occupied
                </span>
              </div>
            </div>

            {room.description && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="font-semibold text-xs text-foreground">Room Details</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {room.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
