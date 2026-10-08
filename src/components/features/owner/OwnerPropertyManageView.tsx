"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Building2,
  BedDouble,
  Activity,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Calendar,
  FileText,
  Clock,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RoomDialog } from "@/components/features/owner/RoomDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useProperty, useUpdateProperty } from "@/hooks/use-properties";
import { useDeleteRoom } from "@/hooks/use-rooms";
import { useIncomingViewings } from "@/hooks/use-viewings";
import { useIncomingApplications } from "@/hooks/use-applications";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Room, ViewingRequest, Application } from "@/lib/api/types";

const propertyEditSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  area: z.string().optional(),
  amenities: z.array(z.string()),
  images: z.array(z.string()).min(1, "Upload at least 1 property photo"),
  isPublished: z.boolean(),
});

type PropertyEditFormData = z.infer<typeof propertyEditSchema>;

interface OwnerPropertyManageViewProps {
  propertyId: string;
}

export function OwnerPropertyManageView({ propertyId }: OwnerPropertyManageViewProps) {
  const { user, isAdmin } = useAuth();
  const { data: property, isLoading } = useProperty(propertyId);
  const updateMutation = useUpdateProperty(propertyId);
  const deleteRoomMutation = useDeleteRoom(propertyId);

  const { data: allIncomingViewings = [] } = useIncomingViewings();
  const { data: allIncomingApplications = [] } = useIncomingApplications();

  const [activeTab, setActiveTab] = useState("details");
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteRoomTarget, setDeleteRoomTarget] = useState<Room | null>(null);
  const [customAmenity, setCustomAmenity] = useState("");

  const form = useForm<PropertyEditFormData>({
    resolver: zodResolver(propertyEditSchema),
    defaultValues: {
      title: property?.title || "",
      description: property?.description || "",
      address: property?.address || "",
      city: property?.city || "",
      area: property?.area || "",
      amenities: property?.amenities || [],
      images: property?.images || [],
      isPublished: property?.isPublished ?? true,
    },
    values: property
      ? {
          title: property.title,
          description: property.description,
          address: property.address,
          city: property.city,
          area: property.area || "",
          amenities: property.amenities || [],
          images: property.images || [],
          isPublished: property.isPublished,
        }
      : undefined,
  });

  const selectedAmenities = form.watch("amenities") || [];
  const imagesValue = form.watch("images") || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="h-96 bg-muted/30 animate-pulse" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-bold">Property not found</h3>
        <p className="text-sm text-muted-foreground">The requested property does not exist or has been removed.</p>
        <Button render={<Link href="/owner/properties" />} variant="outline">
          Back to My Properties
        </Button>
      </div>
    );
  }

  // Ownership verification check
  if (user && property.ownerId !== user.id && !isAdmin) {
    return (
      <Card className="max-w-md mx-auto my-12 border-destructive/30">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground">
            You do not have permission to manage this property. Only the property host or administrator can edit listings.
          </p>
          <Button render={<Link href="/owner/properties" />} className="w-full">
            Return to Properties
          </Button>
        </CardContent>
      </Card>
    );
  }

  const rooms: Room[] = property.rooms || [];
  const propertyViewings = allIncomingViewings.filter(
    (v) => v.propertyId === property.id || v.room?.propertyId === property.id
  );
  const propertyApplications = allIncomingApplications.filter(
    (a) => a.room?.propertyId === property.id
  );

  const onDetailsSubmit = async (data: PropertyEditFormData) => {
    await updateMutation.mutateAsync({
      title: data.title,
      description: data.description,
      address: data.address,
      city: data.city,
      area: data.area || undefined,
      amenities: data.amenities,
      images: data.images,
      isPublished: data.isPublished,
    });
  };

  const handleToggleAmenity = (name: string) => {
    const next = selectedAmenities.includes(name)
      ? selectedAmenities.filter((a) => a !== name)
      : [...selectedAmenities, name];
    form.setValue("amenities", next, { shouldValidate: true });
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!selectedAmenities.includes(trimmed)) {
      form.setValue("amenities", [...selectedAmenities, trimmed], { shouldValidate: true });
    }
    setCustomAmenity("");
  };

  const handleDeleteRoomConfirm = async () => {
    if (!deleteRoomTarget) return;
    try {
      await deleteRoomMutation.mutateAsync(deleteRoomTarget.id);
    } finally {
      setDeleteRoomTarget(null);
    }
  };

  // Rooms Column Definition
  const roomColumns: ColumnDef<Room>[] = [
    {
      header: "Unit",
      cell: (item: Room) => <DoorPlate roomNumber={item.roomNumber} size="md" />,
    },
    {
      header: "Rent / Deposit",
      cell: (item: Room) => (
        <div className="space-y-0.5 text-xs font-mono">
          <div className="font-bold text-foreground">
            <MoneyText amount={item.rentAmount} />
            <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
          </div>
          <div className="text-muted-foreground text-[11px]">
            Dep: <MoneyText amount={item.depositAmount} />
          </div>
        </div>
      ),
    },
    {
      header: "Capacity",
      cell: (item: Room) => (
        <span className="text-xs text-foreground font-mono">
          {item.currentOccupancy} / {item.capacity} Occupied
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: Room) => <StatusBadge status={item.status} />,
    },
    {
      header: "",
      className: "text-right",
      cell: (item: Room) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => {
              setEditingRoom(item);
              setRoomDialogOpen(true);
            }}
            title="Edit Room"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="sr-only">Edit room</span>
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteRoomTarget(item)}
            title="Delete Room"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="sr-only">Delete room</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="space-y-4">
        <Link
          href="/owner/properties"
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Properties
        </Link>

        <PageHeader
          title={property.title}
          description={`${property.address}, ${property.city} • ${rooms.length} units listed`}
          actions={
            <Button
              render={<Link href={`/properties/${property.id}`} target="_blank" />}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              Public View
            </Button>
          }
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md w-full">
          <TabsTrigger value="details" className="text-xs">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Details
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-xs">
            <BedDouble className="w-3.5 h-3.5 mr-1.5" />
            Rooms ({rooms.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs">
            <Activity className="w-3.5 h-3.5 mr-1.5" />
            Activity ({propertyViewings.length + propertyApplications.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Property Details Form */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Listing Information</CardTitle>
              <CardDescription className="text-xs">
                Update property headline, photos, amenities, and visibility status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form id="edit-property-form" onSubmit={form.handleSubmit(onDetailsSubmit)} className="space-y-5 text-xs">
                {/* Published Switch */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground text-xs">Public Visibility</span>
                    <p className="text-[11px] text-muted-foreground">
                      When published, renters can discover this listing in property search.
                    </p>
                  </div>
                  <Controller
                    name="isPublished"
                    control={form.control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Listing Title</label>
                  <Input placeholder="Property title" className="text-xs" {...form.register("title")} />
                  {form.formState.errors.title && (
                    <p className="text-[11px] text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Street Address</label>
                    <Input className="text-xs" {...form.register("address")} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">City</label>
                    <Input className="text-xs" {...form.register("city")} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Area / Neighborhood</label>
                    <Input className="text-xs" {...form.register("area")} />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <Textarea rows={4} className="text-xs" {...form.register("description")} />
                  {form.formState.errors.description && (
                    <p className="text-[11px] text-destructive">{form.formState.errors.description.message}</p>
                  )}
                </div>

                {/* Photos */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Property Photos</label>
                  <ImageUploader
                    value={imagesValue}
                    onChange={(urls) => form.setValue("images", urls, { shouldValidate: true })}
                    folder="properties"
                    maxFiles={6}
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-2 pt-2 border-t">
                  <label className="text-xs font-medium text-foreground">Amenities</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "WiFi",
                      "Air Conditioning",
                      "Kitchen",
                      "Washing Machine",
                      "Refrigerator",
                      "Balcony",
                      "Elevator",
                      "Security / CCTV",
                      "Generator Backup",
                      "Parking",
                    ].map((name) => {
                      const isSelected = selectedAmenities.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleToggleAmenity(name)}
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary font-medium"
                              : "bg-card hover:bg-muted text-foreground border-border"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                          {name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 max-w-sm pt-1">
                    <Input
                      placeholder="Add amenity..."
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomAmenity();
                        }
                      }}
                      className="text-xs h-7"
                    />
                    <Button type="button" variant="outline" size="xs" onClick={handleAddCustomAmenity}>
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                type="submit"
                form="edit-property-form"
                disabled={updateMutation.isPending}
                size="sm"
              >
                {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Save Property Details
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Tab 2: Rooms Inventory */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Room Units & Capacities</h3>
              <p className="text-xs text-muted-foreground">Manage individual room rent, deposit, and status.</p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingRoom(null);
                setRoomDialogOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Room
            </Button>
          </div>

          <DataTable
            columns={roomColumns}
            data={rooms}
            keyExtractor={(item) => item.id}
            emptyTitle="No rooms configured"
            emptyDescription="Add at least one room unit to start taking tenant applications."
          />
        </TabsContent>

        {/* Tab 3: Property Activity */}
        <TabsContent value="activity" className="space-y-6">
          {/* Viewings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Viewing Requests for this Property ({propertyViewings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {propertyViewings.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 text-center">No viewing requests scheduled.</p>
              ) : (
                propertyViewings.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{v.tenant?.name || "Tenant"}</span>
                        {v.room?.roomNumber && <DoorPlate roomNumber={v.room.roomNumber} size="sm" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(v.requestedDate)}</span>
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Applications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Rental Applications for this Property ({propertyApplications.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {propertyApplications.length === 0 ? (
                <p className="text-xs text-muted-foreground py-3 text-center">No submitted applications yet.</p>
              ) : (
                propertyApplications.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{a.tenant?.name || "Tenant"}</span>
                        {a.room?.roomNumber && <DoorPlate roomNumber={a.room.roomNumber} size="sm" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Move-in: {formatDate(a.moveInDate)} {a.message ? `• "${a.message}"` : ""}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Room Add/Edit Dialog */}
      <RoomDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        propertyId={property.id}
        roomToEdit={editingRoom}
      />

      {/* Delete Room Confirmation */}
      <ConfirmDialog
        open={!!deleteRoomTarget}
        onOpenChange={(open) => !open && setDeleteRoomTarget(null)}
        title="Delete Room Unit?"
        description={`Are you sure you want to delete room unit ${deleteRoomTarget?.roomNumber || ""}? This cannot be undone.`}
        confirmText="Delete Room"
        variant="destructive"
        isLoading={deleteRoomMutation.isPending}
        onConfirm={handleDeleteRoomConfirm}
      />
    </div>
  );
}
