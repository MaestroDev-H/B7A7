"use client";

import * as React from "react";
import Link from "next/link";
import { Users, Eye, FileCheck, LogIn, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { RequestViewingDialog } from "@/components/features/properties/RequestViewingDialog";
import { ApplyDialog } from "@/components/features/properties/ApplyDialog";
import { useAuth } from "@/hooks/use-auth";
import type { Room } from "@/lib/api/types";

interface RoomCardProps {
  room: Room;
  propertyTitle: string;
  isOwnerOfProperty?: boolean;
}

export function RoomCard({
  room,
  propertyTitle,
  isOwnerOfProperty = false,
}: RoomCardProps) {
  const { user, role, isTenant } = useAuth();
  const [viewingOpen, setViewingOpen] = React.useState(false);
  const [applyOpen, setApplyOpen] = React.useState(false);

  const isAvailable = room.status === "AVAILABLE";
  const occupancyPercent =
    room.capacity > 0
      ? Math.round((room.currentOccupancy / room.capacity) * 100)
      : 0;

  return (
    <>
      <Card className="rounded-xl border border-border/80 hover:border-border transition-all bg-card overflow-hidden shadow-2xs">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left Room Info */}
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <DoorPlate roomNumber={room.roomNumber} size="md" />

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={room.status} />
                <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                  <Users className="h-3.5 w-3.5" />
                  {room.currentOccupancy} / {room.capacity} occupied
                </span>
              </div>

              {room.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {room.description}
                </p>
              )}
            </div>
          </div>

          {/* Right Price & Actions */}
          <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-border/60">
            <div className="text-right space-y-0.5">
              <div className="font-display font-bold text-base text-foreground">
                <MoneyText amount={Number(room.rentAmount)} />
                <span className="text-xs font-normal text-muted-foreground">/mo</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Deposit: <MoneyText amount={Number(room.depositAmount)} />
              </div>
            </div>

            {/* Role-Specific Action Buttons */}
            <div className="flex items-center gap-2">
              {!user ? (
                <Link
                  href={`/login?next=/properties`}
                  className={buttonVariants({ variant: "outline", size: "xs", className: "text-xs" })}
                >
                  <LogIn className="h-3 w-3 mr-1" />
                  Sign in to Apply
                </Link>
              ) : isTenant && isAvailable ? (
                <>
                  <Button
                    variant="outline"
                    size="xs"
                    className="text-xs h-7"
                    onClick={() => setViewingOpen(true)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Viewing
                  </Button>
                  <Button
                    size="xs"
                    className="text-xs h-7"
                    onClick={() => setApplyOpen(true)}
                  >
                    <FileCheck className="h-3 w-3 mr-1" />
                    Apply
                  </Button>
                </>
              ) : isOwnerOfProperty ? (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Managed Unit
                </span>
              ) : (
                <Link
                  href={`/rooms/${room.id}`}
                  className={buttonVariants({ variant: "ghost", size: "xs", className: "text-xs text-muted-foreground hover:text-foreground" })}
                >
                  View Details &rarr;
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Viewing Dialog */}
      <RequestViewingDialog
        open={viewingOpen}
        onOpenChange={setViewingOpen}
        room={room}
        propertyTitle={propertyTitle}
      />

      {/* Apply Dialog */}
      <ApplyDialog
        open={applyOpen}
        onOpenChange={setApplyOpen}
        room={room}
        propertyTitle={propertyTitle}
      />
    </>
  );
}
