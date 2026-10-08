"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  Sparkles,
  Edit,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DoorPlate } from "@/components/shared/DoorPlate";
import { MoneyText } from "@/components/shared/MoneyText";
import { Progress } from "@/components/ui/progress";
import { usePropertyWizardStore, type WizardRoom } from "@/stores/property-wizard-store";
import { clientFetch } from "@/lib/api/http.client";
import { propertiesService } from "@/lib/api/services/properties";
import { roomsService } from "@/lib/api/services/rooms";
import { toast } from "sonner";

interface StepProgressItem {
  name: string;
  status: "PENDING" | "LOADING" | "SUCCESS" | "ERROR";
  error?: string;
  roomId?: string;
}

export default function StepReview() {
  const router = useRouter();
  const {
    title,
    type,
    description,
    address,
    city,
    area,
    amenities,
    images,
    rooms,
    setStep,
    prevStep,
    resetWizard,
  } = usePropertyWizardStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPropertyId, setCreatedPropertyId] = useState<string | null>(null);
  const [progressItems, setProgressItems] = useState<StepProgressItem[]>([]);

  const handlePublish = async () => {
    setIsSubmitting(true);

    const initialSteps: StepProgressItem[] = [
      { name: "Create Property Listing", status: "LOADING" },
      ...rooms.map((r) => ({
        name: `Create Unit ${r.roomNumber}`,
        status: "PENDING" as const,
        roomId: r.id,
      })),
    ];
    setProgressItems(initialSteps);

    let currentPropId = createdPropertyId;

    // Step 1: Create Property (if not created already in a previous partial retry)
    if (!currentPropId) {
      try {
        const newProperty = await propertiesService.create(clientFetch, {
          title,
          type,
          description,
          address,
          city,
          area: area || undefined,
          amenities,
          images,
          isPublished: true,
        });

        currentPropId = newProperty.id;
        setCreatedPropertyId(newProperty.id);

        setProgressItems((prev) =>
          prev.map((item, idx) => (idx === 0 ? { ...item, status: "SUCCESS" } : item))
        );
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Failed to create property";
        setProgressItems((prev) =>
          prev.map((item, idx) =>
            idx === 0 ? { ...item, status: "ERROR", error: errorMsg } : item
          )
        );
        toast.error(errorMsg);
        setIsSubmitting(false);
        return;
      }
    }

    // Step 2: Create each room sequentially
    let allRoomsSuccessful = true;

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      if (!room) continue;
      const stepIndex = i + 1;

      // Skip already successful rooms in retries
      if (progressItems[stepIndex]?.status === "SUCCESS") {
        continue;
      }

      setProgressItems((prev) =>
        prev.map((item, idx) => (idx === stepIndex ? { ...item, status: "LOADING" } : item))
      );

      try {
        await roomsService.createForProperty(clientFetch, currentPropId, {
          roomNumber: room.roomNumber,
          capacity: Number(room.capacity),
          rentAmount: Number(room.rentAmount),
          depositAmount: Number(room.depositAmount),
          description: room.description || undefined,
        });

        setProgressItems((prev) =>
          prev.map((item, idx) => (idx === stepIndex ? { ...item, status: "SUCCESS" } : item))
        );
      } catch (err: unknown) {
        allRoomsSuccessful = false;
        const errorMsg = err instanceof Error ? err.message : "Failed to create room";
        setProgressItems((prev) =>
          prev.map((item, idx) =>
            idx === stepIndex ? { ...item, status: "ERROR", error: errorMsg } : item
          )
        );
      }
    }

    setIsSubmitting(false);

    if (allRoomsSuccessful && currentPropId) {
      toast.success("Property and all rooms published successfully!");
      resetWizard();
      router.push(`/owner/properties/${currentPropId}`);
    } else {
      toast.warning("Property was created, but some rooms failed. Click retry below.");
    }
  };

  const handleRetryRoom = async (roomIndex: number) => {
    if (!createdPropertyId) return;
    const room = rooms[roomIndex];
    if (!room) return;
    const stepIndex = roomIndex + 1;

    setProgressItems((prev) =>
      prev.map((item, idx) => (idx === stepIndex ? { ...item, status: "LOADING", error: undefined } : item))
    );

    try {
      await roomsService.createForProperty(clientFetch, createdPropertyId, {
        roomNumber: room.roomNumber,
        capacity: Number(room.capacity),
        rentAmount: Number(room.rentAmount),
        depositAmount: Number(room.depositAmount),
        description: room.description || undefined,
      });

      setProgressItems((prev) =>
        prev.map((item, idx) => (idx === stepIndex ? { ...item, status: "SUCCESS" } : item))
      );

      toast.success(`Unit ${room.roomNumber} created`);

      // Check if all are now done
      const allDone = progressItems.every((item, idx) =>
        idx === stepIndex ? true : item.status === "SUCCESS"
      );

      if (allDone) {
        resetWizard();
        router.push(`/owner/properties/${createdPropertyId}`);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to create room";
      setProgressItems((prev) =>
        prev.map((item, idx) =>
          idx === stepIndex ? { ...item, status: "ERROR", error: errorMsg } : item
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Step 5: Review & Publish</CardTitle>
          <CardDescription className="text-xs">
            Review your listing summary before publishing live to renters on Nestly.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-xs">
          {/* Section 1: Basics Review */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground text-sm">{title}</span>
                <StatusBadge status={type} />
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setStep(1)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>
            <p className="text-muted-foreground line-clamp-2">{description}</p>
          </div>

          {/* Section 2: Location & Amenities Review */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {address}, {city} {area ? `(${area})` : ""}
              </div>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setStep(2)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {amenities.map((a) => (
                <Badge key={a} variant="secondary" className="text-[10px] px-2 py-0.5">
                  ✓ {a}
                </Badge>
              ))}
            </div>
          </div>

          {/* Section 3: Photos Review */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Photos ({images.length})</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setStep(3)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {images.map((url, idx) => (
                <div key={url + idx} className="relative w-16 h-12 rounded-lg overflow-hidden border">
                  <Image src={url} alt={`Photo ${idx + 1}`} fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Rooms Review */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Room Units ({rooms.length})</span>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setStep(4)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="p-3 rounded-lg border bg-card flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <DoorPlate roomNumber={room.roomNumber} size="sm" />
                    <div>
                      <p className="font-medium text-foreground">{room.capacity} Bed Capacity</p>
                      <p className="text-[11px] text-muted-foreground">
                        Dep: <MoneyText amount={room.depositAmount} />
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-bold text-foreground font-mono">
                    <MoneyText amount={room.rentAmount} />
                    <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sequential Submission Progress List */}
          {progressItems.length > 0 && (
            <div className="p-4 rounded-xl bg-card border shadow-xs space-y-3" aria-live="polite">
              <h4 className="font-semibold text-sm text-foreground">Publishing Progress</h4>

              <div className="space-y-2">
                {progressItems.map((item, idx) => (
                  <div
                    key={item.name + idx}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {item.status === "LOADING" && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                      )}
                      {item.status === "SUCCESS" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {item.status === "ERROR" && (
                        <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                      )}
                      {item.status === "PENDING" && (
                        <div className="w-4 h-4 rounded-full border border-dashed border-muted-foreground shrink-0" />
                      )}
                      <span
                        className={
                          item.status === "SUCCESS"
                            ? "font-medium text-foreground"
                            : item.status === "ERROR"
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                        }
                      >
                        {item.name}
                      </span>
                    </div>

                    {item.status === "ERROR" && idx > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => handleRetryRoom(idx - 1)}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" /> Retry
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Rooms
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePublish}
            disabled={isSubmitting}
            className="shadow-xs bg-primary hover:bg-primary/90 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Publishing Units...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1.5" />
                Publish Property Listing
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
