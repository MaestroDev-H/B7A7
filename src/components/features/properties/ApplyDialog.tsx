"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, ArrowRight, FileCheck } from "lucide-react";

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
import { MoneyText } from "@/components/shared/MoneyText";
import { useCreateApplication } from "@/hooks/use-applications";
import { toISODateTime } from "@/lib/format";
import type { Room } from "@/lib/api/types";

const applySchema = z.object({
  moveInDate: z.string().min(1, "Please select an intended move-in date"),
  message: z.string().max(500, "Message must be 500 characters or less").optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room;
  propertyTitle: string;
}

export default function ApplyDialog({
  open,
  onOpenChange,
  room,
  propertyTitle,
}: ApplyDialogProps) {
  const router = useRouter();
  const createApplicationMutation = useCreateApplication();

  const todayStr = new Date().toISOString().split("T")[0] || "";

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      moveInDate: todayStr,
      message: "",
    },
  });

  async function onSubmit(values: ApplyFormValues) {
    try {
      const isoMoveInDate = toISODateTime(values.moveInDate, "12:00");

      await createApplicationMutation.mutateAsync({
        roomId: room.id,
        moveInDate: isoMoveInDate,
        message: values.message || undefined,
      });

      toast.success("Rental application submitted successfully!", {
        action: {
          label: "View applications",
          onClick: () => router.push("/dashboard/applications"),
        },
      });

      onOpenChange(false);
      form.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit application";
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
            Submit Rental Application
          </DialogTitle>
          <DialogDescription className="text-xs">
            Apply to lease this room. Once approved, your tenancy and deposit invoice will be generated.
          </DialogDescription>
        </DialogHeader>

        {/* Room Financial Summary */}
        <div className="p-3 rounded-xl bg-muted/40 border border-border grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px]">Monthly Rent</span>
            <span className="font-semibold text-foreground font-display">
              <MoneyText amount={Number(room.rentAmount)} />
              /mo
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Security Deposit</span>
            <span className="font-semibold text-foreground font-display">
              <MoneyText amount={Number(room.depositAmount)} />
            </span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
            <FormField
              control={form.control}
              name="moveInDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Intended Move-in Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={todayStr}
                      disabled={createApplicationMutation.isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Message to Host <span className="text-muted-foreground font-normal">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly introduce yourself and share any lease duration preferences..."
                      rows={3}
                      disabled={createApplicationMutation.isPending}
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
                disabled={createApplicationMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createApplicationMutation.isPending}
              >
                {createApplicationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Application
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

export { ApplyDialog };
