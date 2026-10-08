"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Receipt, DollarSign, Calendar, Info, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateInvoice } from "@/hooks/use-tenancies";
import { toISODateTime } from "@/lib/format";
import type { Tenancy, InvoiceType } from "@/lib/api/types";
import { toast } from "sonner";

const invoiceSchema = z.object({
  type: z.enum(["RENT", "UTILITY"] as const),
  amount: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface GenerateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenancy: Tenancy | null;
}

export function GenerateInvoiceDialog({
  open,
  onOpenChange,
  tenancy,
}: GenerateInvoiceDialogProps) {
  const tenancyId = tenancy?.id || "";
  const generateMutation = useGenerateInvoice(tenancyId);

  // Calculate default due date (7 days from now)
  const defaultDueDate = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0] || "";
  }, []);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: "RENT",
      amount: tenancy?.room?.rentAmount ? String(tenancy.room.rentAmount) : "",
      dueDate: defaultDueDate,
      description: "",
    },
  });

  const selectedType = form.watch("type");

  React.useEffect(() => {
    if (tenancy && open) {
      form.reset({
        type: "RENT",
        amount: tenancy.room?.rentAmount ? String(tenancy.room.rentAmount) : "",
        dueDate: defaultDueDate,
        description: "",
      });
    }
  }, [tenancy, open, defaultDueDate, form]);

  const onSubmit = async (data: InvoiceFormData) => {
    if (!tenancy) return;

    if (data.type === "UTILITY" && (!data.amount || Number(data.amount) <= 0)) {
      form.setError("amount", { message: "Amount is required for utility invoices" });
      return;
    }

    try {
      // Format due date to UTC ISO string with time
      const dueIso = toISODateTime(`${data.dueDate}T23:59:59Z`);

      await generateMutation.mutateAsync({
        type: data.type,
        amount: data.amount ? Number(data.amount) : undefined,
        dueDate: dueIso,
        description: data.description?.trim() || undefined,
      });

      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate invoice";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-primary" />
            Generate Tenancy Invoice
          </DialogTitle>
          <DialogDescription className="text-xs">
            Issue a rent or utility invoice for {tenancy?.tenant?.name || "the tenant"} (Unit{" "}
            {tenancy?.room?.roomNumber || "N/A"}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-xs py-2">
          {/* Invoice Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Invoice Type</label>
            <Select
              value={selectedType}
              onValueChange={(val) => {
                const typedVal = val as "RENT" | "UTILITY";
                form.setValue("type", typedVal, { shouldValidate: true });
                if (typedVal === "RENT" && tenancy?.room?.rentAmount) {
                  form.setValue("amount", String(tenancy.room.rentAmount));
                }
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RENT">Rent (Monthly)</SelectItem>
                <SelectItem value="UTILITY">Utility Bill (Electricity/Water/Gas/Internet)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">
                Amount ($ USD) {selectedType === "UTILITY" && <span className="text-destructive">*</span>}
              </label>
              {selectedType === "RENT" && (
                <span className="text-[10px] text-muted-foreground">
                  Leave blank to use default rent (${tenancy?.room?.rentAmount || "0"})
                </span>
              )}
            </div>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder={
                  selectedType === "RENT"
                    ? String(tenancy?.room?.rentAmount || "0")
                    : "Enter split portion amount"
                }
                className="pl-8 text-xs font-mono"
                {...form.register("amount")}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-[11px] text-destructive">{form.formState.errors.amount.message}</p>
            )}

            {selectedType === "UTILITY" && (
              <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-muted/40 text-[11px] text-muted-foreground border">
                <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p>
                  For utility bills, specify this tenant&apos;s split portion. If shared evenly across roommates, calculate the per-tenant share prior to generating.
                </p>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Due Date</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                type="date"
                className="pl-8 text-xs font-mono"
                {...form.register("dueDate")}
              />
            </div>
            {form.formState.errors.dueDate && (
              <p className="text-[11px] text-destructive">{form.formState.errors.dueDate.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Description / Notes (Optional)</label>
            <Textarea
              placeholder={
                selectedType === "RENT"
                  ? "e.g. October 2026 Monthly Rent"
                  : "e.g. Electricity + High-Speed WiFi split for Sept"
              }
              rows={2}
              className="text-xs"
              {...form.register("description")}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
              Issue Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
