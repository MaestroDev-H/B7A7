"use client";

import * as React from "react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, BedDouble, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { usePropertyWizardStore, type WizardRoom } from "@/stores/property-wizard-store";
import { toast } from "sonner";

export default function StepRooms() {
  const { rooms, setRooms, nextStep, prevStep } = usePropertyWizardStore();

  const [localRooms, setLocalRooms] = useState<WizardRoom[]>(
    rooms.length > 0
      ? rooms
      : [
          {
            id: `room-${Date.now()}`,
            roomNumber: "A-101",
            capacity: 1,
            rentAmount: 800,
            depositAmount: 800,
            description: "Spacious master bedroom with attached bathroom",
          },
        ]
  );

  const handleAddRoom = () => {
    const nextNum = `A-${101 + localRooms.length}`;
    setLocalRooms((prev) => [
      ...prev,
      {
        id: `room-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        roomNumber: nextNum,
        capacity: 1,
        rentAmount: 600,
        depositAmount: 600,
        description: "",
      },
    ]);
  };

  const handleRemoveRoom = (id: string) => {
    if (localRooms.length <= 1) {
      toast.error("A property must have at least one room unit");
      return;
    }
    setLocalRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateField = (
    id: string,
    field: keyof WizardRoom,
    value: string | number
  ) => {
    setLocalRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleNext = () => {
    if (localRooms.length === 0) {
      toast.error("Please add at least one room unit");
      return;
    }

    // Validation: Unique room numbers and positive amounts
    const roomNumbers = new Set<string>();
    for (const r of localRooms) {
      const trimmedNumber = r.roomNumber.trim();
      if (!trimmedNumber) {
        toast.error("All rooms must have a room number / identifier");
        return;
      }
      if (roomNumbers.has(trimmedNumber.toUpperCase())) {
        toast.error(`Room number "${trimmedNumber}" is duplicated. Each room must have a unique number.`);
        return;
      }
      roomNumbers.add(trimmedNumber.toUpperCase());

      if (r.capacity < 1) {
        toast.error(`Room ${trimmedNumber} capacity must be at least 1`);
        return;
      }
      if (r.rentAmount <= 0) {
        toast.error(`Room ${trimmedNumber} rent amount must be greater than $0`);
        return;
      }
      if (r.depositAmount < 0) {
        toast.error(`Room ${trimmedNumber} deposit amount cannot be negative`);
        return;
      }
    }

    setRooms(localRooms);
    nextStep();
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-lg">Step 4: Room Units & Pricing</CardTitle>
          <CardDescription className="text-xs">
            Configure individual rooms, bed capacities, monthly rent amounts, and security deposits.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleAddRoom}>
          <Plus className="w-4 h-4 mr-1" />
          Add Room
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {localRooms.map((room, idx) => (
          <div
            key={room.id}
            className="p-4 rounded-xl border bg-card/60 hover:bg-card space-y-4 shadow-2xs transition-all"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <DoorPlate roomNumber={room.roomNumber || `Room ${idx + 1}`} size="md" />
                <span className="font-semibold text-xs text-foreground">Unit #{idx + 1}</span>
              </div>

              {localRooms.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveRoom(room.id)}
                  title="Remove room"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="sr-only">Remove room</span>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Room Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Room Number / ID</label>
                <Input
                  value={room.roomNumber}
                  onChange={(e) => handleUpdateField(room.id, "roomNumber", e.target.value)}
                  placeholder="e.g. A-101"
                  className="text-xs h-8"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Bed Capacity</label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={room.capacity}
                  onChange={(e) =>
                    handleUpdateField(room.id, "capacity", Number.parseInt(e.target.value) || 1)
                  }
                  className="text-xs h-8"
                />
              </div>

              {/* Rent Amount */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Rent ($/mo)</label>
                <Input
                  type="number"
                  min="1"
                  step="25"
                  value={room.rentAmount}
                  onChange={(e) =>
                    handleUpdateField(room.id, "rentAmount", Number.parseFloat(e.target.value) || 0)
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>

              {/* Deposit Amount */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Deposit ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="25"
                  value={room.depositAmount}
                  onChange={(e) =>
                    handleUpdateField(room.id, "depositAmount", Number.parseFloat(e.target.value) || 0)
                  }
                  className="text-xs h-8 font-mono"
                />
              </div>
            </div>

            {/* Room Description */}
            <div className="space-y-1 text-xs">
              <label className="text-[11px] font-medium text-muted-foreground">
                Room Description (Optional)
              </label>
              <Input
                value={room.description || ""}
                onChange={(e) => handleUpdateField(room.id, "description", e.target.value)}
                placeholder="e.g. Corner room with garden view, study desk included"
                className="text-xs h-8"
              />
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" size="sm" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>
        <Button type="button" size="sm" onClick={handleNext}>
          Review & Publish
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
