"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BedDouble, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateRoom, useUpdateRoom } from "@/hooks/use-rooms";
import type { Room, RoomStatus } from "@/lib/api/types";

const roomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  rentAmount: z.number().min(1, "Rent must be greater than 0"),
  depositAmount: z.number().min(0, "Deposit cannot be negative"),
  description: z.string().optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "UNDER_MAINTENANCE"] as const).optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  roomToEdit?: Room | null;
}

export function RoomDialog({
  open,
  onOpenChange,
  propertyId,
  roomToEdit,
}: RoomDialogProps) {
  const isEditing = !!roomToEdit;
  const createMutation = useCreateRoom(propertyId);
  const updateMutation = useUpdateRoom(roomToEdit?.id || "", propertyId);

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: roomToEdit?.roomNumber || "",
      capacity: roomToEdit?.capacity || 1,
      rentAmount: Number(roomToEdit?.rentAmount) || 500,
      depositAmount: Number(roomToEdit?.depositAmount) || 500,
      description: roomToEdit?.description || "",
      status: roomToEdit?.status || "AVAILABLE",
    },
    values: roomToEdit
      ? {
          roomNumber: roomToEdit.roomNumber,
          capacity: roomToEdit.capacity,
          rentAmount: Number(roomToEdit.rentAmount),
          depositAmount: Number(roomToEdit.depositAmount),
          description: roomToEdit.description || "",
          status: roomToEdit.status,
        }
      : undefined,
  });

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (isEditing && roomToEdit) {
        await updateMutation.mutateAsync({
          roomNumber: data.roomNumber,
          capacity: data.capacity,
          rentAmount: data.rentAmount,
          depositAmount: data.depositAmount,
          description: data.description || undefined,
          status: data.status,
        });
      } else {
        await createMutation.mutateAsync({
          roomNumber: data.roomNumber,
          capacity: data.capacity,
          rentAmount: data.rentAmount,
          depositAmount: data.depositAmount,
          description: data.description || undefined,
        });
      }

      form.reset();
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <BedDouble className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEditing ? `Edit Room ${roomToEdit.roomNumber}` : "Add New Room Unit"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEditing
                  ? "Update pricing, bed capacity, and maintenance status."
                  : "Add an individual room unit to this property listing."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="room-dialog-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            {/* Room Number */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Room Number</label>
              <Input
                placeholder="e.g. A-101"
                className="text-xs"
                {...form.register("roomNumber")}
              />
              {form.formState.errors.roomNumber && (
                <p className="text-[11px] text-destructive">{form.formState.errors.roomNumber.message}</p>
              )}
            </div>

            {/* Capacity */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Bed Capacity</label>
              <Input
                type="number"
                min="1"
                className="text-xs"
                {...form.register("capacity", { valueAsNumber: true })}
              />
              {form.formState.errors.capacity && (
                <p className="text-[11px] text-destructive">{form.formState.errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Rent Amount */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Monthly Rent ($)</label>
              <Input
                type="number"
                min="1"
                step="25"
                className="text-xs font-mono"
                {...form.register("rentAmount", { valueAsNumber: true })}
              />
              {form.formState.errors.rentAmount && (
                <p className="text-[11px] text-destructive">{form.formState.errors.rentAmount.message}</p>
              )}
            </div>

            {/* Deposit Amount */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Security Deposit ($)</label>
              <Input
                type="number"
                min="0"
                step="25"
                className="text-xs font-mono"
                {...form.register("depositAmount", { valueAsNumber: true })}
              />
              {form.formState.errors.depositAmount && (
                <p className="text-[11px] text-destructive">{form.formState.errors.depositAmount.message}</p>
              )}
            </div>
          </div>

          {/* Status (Only when editing) */}
          {isEditing && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Room Status</label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available for Rent</SelectItem>
                      <SelectItem value="OCCUPIED">Occupied</SelectItem>
                      <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Room Description (Optional)</label>
            <Textarea
              placeholder="e.g. South-facing window, private bathroom, desk and wardrobe..."
              rows={3}
              className="text-xs"
              {...form.register("description")}
            />
          </div>
        </form>

        <DialogFooter className="pt-2 border-t">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="room-dialog-form" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {isEditing ? "Save Room" : "Add Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
