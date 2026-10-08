"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  variant = "default",
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  const finalConfirmLabel = confirmText || confirmLabel || "Confirm";
  const finalCancelLabel = cancelText || cancelLabel || "Cancel";
  const [internalLoading, setInternalLoading] = React.useState(false);
  const loading = isLoading || internalLoading;

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      setInternalLoading(true);
      await onConfirm();
      onOpenChange?.(false);
    } catch {
      // Handled by caller's toast
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger render={trigger} />}
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-lg">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={loading}>
            {finalCancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              variant === "destructive" &&
                "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              finalConfirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
