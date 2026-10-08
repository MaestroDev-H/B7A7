"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn, Settings, Eye, Trash2, EyeOff } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useAuth } from "@/hooks/use-auth";
import { useDeleteProperty, useOptimisticTogglePublish } from "@/hooks/use-properties";
import type { Property } from "@/lib/api/types";

interface PropertyActionsProps {
  property: Property;
}

export function PropertyActions({ property }: PropertyActionsProps) {
  const router = useRouter();
  const { user, isAdmin, isOwner } = useAuth();

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [togglePublishOpen, setTogglePublishOpen] = React.useState(false);

  const deletePropertyMutation = useDeleteProperty();
  const togglePublishMutation = useOptimisticTogglePublish(property.id);

  const isOwnerOfThis = isOwner && user?.id === property.ownerId;

  const handleDelete = async () => {
    try {
      await deletePropertyMutation.mutateAsync(property.id);
      toast.success("Property listing removed successfully");
      router.push("/properties");
    } catch {
      toast.error("Failed to delete property listing");
    }
  };

  const handleTogglePublish = async () => {
    try {
      await togglePublishMutation.mutateAsync({
        isPublished: !property.isPublished,
      });
      toast.success(
        property.isPublished
          ? "Property has been unpublished"
          : "Property is now live and published"
      );
    } catch {
      toast.error("Failed to update publication status");
    }
  };

  if (!user) {
    return (
      <Link
        href={`/login?next=/properties/${property.id}`}
        className={buttonVariants({ variant: "default", size: "sm", className: "text-xs font-semibold" })}
      >
        <LogIn className="h-3.5 w-3.5 mr-1.5" />
        Log in to Request a Viewing
      </Link>
    );
  }

  if (isOwnerOfThis) {
    return (
      <Link
        href={`/owner/properties/${property.id}`}
        className={buttonVariants({ variant: "outline", size: "sm", className: "text-xs font-semibold text-amber-600 dark:text-amber-400 border-amber-500/30" })}
      >
        <Settings className="h-3.5 w-3.5 mr-1.5" />
        Manage Property &amp; Rooms
      </Link>
    );
  }

  if (isAdmin) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTogglePublishOpen(true)}
            className="text-xs"
            disabled={togglePublishMutation.isPending}
          >
            {property.isPublished ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1 text-amber-500" />
                Unpublish
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                Publish
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-xs"
            disabled={deletePropertyMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title="Delete Property Listing"
          description={`Are you sure you want to permanently delete "${property.title}"? This action cannot be undone.`}
          variant="destructive"
          confirmText="Delete Listing"
          onConfirm={handleDelete}
        />

        <ConfirmDialog
          open={togglePublishOpen}
          onOpenChange={setTogglePublishOpen}
          title={property.isPublished ? "Unpublish Listing" : "Publish Listing"}
          description={
            property.isPublished
              ? "This property will be hidden from public discovery results."
              : "This property will be made publicly visible on discovery feeds."
          }
          confirmText={property.isPublished ? "Unpublish" : "Publish"}
          onConfirm={handleTogglePublish}
        />
      </>
    );
  }

  // Tenant / general authenticated view
  return (
    <a
      href="#rooms-section"
      className={buttonVariants({ variant: "default", size: "sm", className: "text-xs font-semibold" })}
    >
      <Eye className="h-3.5 w-3.5 mr-1.5" />
      View Available Rooms &amp; Apply
    </a>
  );
}
