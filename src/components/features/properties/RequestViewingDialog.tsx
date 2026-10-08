"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Loader2, ArrowRight, CheckCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { useCreateViewing } from "@/hooks/use-viewings";
import { toISODateTime } from "@/lib/format";
import type { Room, Property } from "@/lib/api/types";

const viewingSchema = z.object({
  date: z.string().min(1, "Please select a tour date"),
  time: z.string().min(1, "Please select a tour time"),
  note: z.string().max(300, "Note must be 300 characters or less").optional(),
});

type ViewingFormValues = z.infer<typeof viewingSchema>;

interface RequestViewingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  propertyTitle: string;
}

export function RequestViewingDialog({
  open,
  onOpenChange,
  room,
  propertyTitle,
}: RequestViewingDialogProps) {
  const router = useRouter();
  const createViewingMutation = useCreateViewing();

  // Get tomorrow's date formatted as YYYY-MM-DD for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0] || "";

  const form = useForm<ViewingFormValues>({
    resolver: zodResolver(viewingSchema),
    defaultValues: {
      date: minDateStr,
      time: "14:00",
      note: "",
    },
  });

  async function onSubmit(values: ViewingFormValues) {
    try {
      // Combine date and time to ISO string
      const isoDateTime = toISODateTime(values.date, values.time);

      await createViewingMutation.mutateAsync({
        roomId: room.id,
        requestedDate: isoDateTime,
        note: values.note || undefined,
      });

      toast.success("Viewing request submitted to host!", {
        action: {
          label: "View requests",
          onClick: () => router.push("/dashboard/viewings"),
        },
      });

      onOpenChange(false);
      form.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to schedule viewing";
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <DoorPlate roomNumber={room.roomNumber} size="sm" />
            <span className="text-xs text-muted-foreground truncate">{propertyTitle}</span>
          </div>
          <DialogTitle className="font-display text-lg font-bold">
            Schedule a Guided Viewing
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select your preferred appointment date and time for an in-person tour.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Tour Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={minDateStr}
                        disabled={createViewingMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Preferred Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        disabled={createViewingMutation.isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Note for Host <span className="text-muted-foreground font-normal">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Let the owner know if you have specific questions or timing preferences..."
                      rows={3}
                      disabled={createViewingMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={createViewingMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createViewingMutation.isPending}
              >
                {createViewingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Confirm Request
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
