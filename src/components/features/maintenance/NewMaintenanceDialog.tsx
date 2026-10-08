"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wrench, Loader2, Image as ImageIcon } from "lucide-react";
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
import { ImageUploader } from "@/components/shared/ImageUploader";
import { useCreateMaintenanceRequest } from "@/hooks/use-maintenance";
import type { Tenancy, MaintenancePriority } from "@/lib/api/types";

const maintenanceSchema = z.object({
  tenancyId: z.string().min(1, "Please select an active tenancy"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"] as const),
  images: z.array(z.string()).max(4, "Maximum 4 images allowed"),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface NewMaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTenancies: Tenancy[];
}

export function NewMaintenanceDialog({
  open,
  onOpenChange,
  activeTenancies,
}: NewMaintenanceDialogProps) {
  const createMutation = useCreateMaintenanceRequest();

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      tenancyId: activeTenancies[0]?.id || "",
      title: "",
      description: "",
      priority: "MEDIUM",
      images: [],
    },
  });

  const imagesValue = form.watch("images") || [];

  const onSubmit = async (data: MaintenanceFormData) => {
    try {
      await createMutation.mutateAsync({
        tenancyId: data.tenancyId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        images: data.images,
      });

      form.reset();
      onOpenChange(false);
    } catch {
      // Handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Report Maintenance Issue</DialogTitle>
              <DialogDescription className="text-xs">
                Submit a repair request to your property manager or host.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id="new-maintenance-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 text-xs">
          {/* Tenancy Selector */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Active Tenancy / Room</label>
            <Controller
              name="tenancyId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select active lease" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTenancies.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.room?.property?.title || "Property"}{" "}
                        {t.room?.roomNumber ? `(Unit ${t.room.roomNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.tenancyId && (
              <p className="text-[11px] text-destructive">{form.formState.errors.tenancyId.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Issue Title</label>
            <Input
              placeholder="e.g. Bathroom pipe leak, heating not working"
              className="text-xs"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-[11px] text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Priority Level</label>
            <Controller
              name="priority"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - Minor cosmetic issue</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Normal repair needed</SelectItem>
                    <SelectItem value="HIGH">High - Impacts daily living</SelectItem>
                    <SelectItem value="URGENT">Urgent - Emergency / safety risk</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Detailed Description</label>
            <Textarea
              placeholder="Describe what is broken, when it started, and any immediate actions taken..."
              rows={3}
              className="text-xs"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-[11px] text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Photos Upload */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Photos (Up to 4)</label>
            <ImageUploader
              value={imagesValue}
              onChange={(urls) => form.setValue("images", urls, { shouldValidate: true })}
              folder="maintenance"
              maxFiles={4}
              description="Provide clear pictures of the issue to assist repair personnel."
            />
          </div>
        </form>

        <DialogFooter className="pt-2 border-t">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="new-maintenance-form"
            size="sm"
            disabled={createMutation.isPending}
            className="shadow-xs"
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
