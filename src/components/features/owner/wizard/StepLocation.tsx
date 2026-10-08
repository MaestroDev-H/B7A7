"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Plus, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePropertyWizardStore } from "@/stores/property-wizard-store";
import { cn } from "@/lib/utils";

const DEFAULT_AMENITY_PRESETS = [
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
  "Gym",
  "Furnished",
];

const locationSchema = z.object({
  address: z.string().min(3, "Street address must be at least 3 characters"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  area: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

export default function StepLocation() {
  const { address, city, area, amenities, updateLocation, nextStep, prevStep } =
    usePropertyWizardStore();

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    amenities.length > 0 ? amenities : ["WiFi", "Kitchen", "Air Conditioning"]
  );
  const [customAmenity, setCustomAmenity] = useState("");

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address,
      city,
      area,
    },
  });

  const handleToggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (!selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed]);
    }
    setCustomAmenity("");
  };

  const onSubmit = (data: LocationFormData) => {
    updateLocation({
      address: data.address,
      city: data.city,
      area: data.area || "",
      amenities: selectedAmenities,
    });
    nextStep();
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg">Step 2: Location & Amenities</CardTitle>
        <CardDescription className="text-xs">
          Pinpoint where your property is situated and select the living conveniences included.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="wizard-step-2" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 text-xs">
          {/* Street Address */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Street Address</label>
            <Input
              placeholder="e.g. House 42, Road 7/A, Block C"
              className="text-xs"
              {...form.register("address")}
            />
            {form.formState.errors.address && (
              <p className="text-[11px] text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* City */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">City</label>
              <Input placeholder="e.g. Dhaka" className="text-xs" {...form.register("city")} />
              {form.formState.errors.city && (
                <p className="text-[11px] text-destructive">{form.formState.errors.city.message}</p>
              )}
            </div>

            {/* Area / Neighborhood */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Area / Neighborhood</label>
              <Input
                placeholder="e.g. Dhanmondi, Banani, Gulshan"
                className="text-xs"
                {...form.register("area")}
              />
            </div>
          </div>

          {/* Amenities Selection Chips */}
          <div className="space-y-2 pt-2 border-t">
            <label className="text-xs font-medium text-foreground">Included Amenities</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_AMENITY_PRESETS.map((name) => {
                const isSelected = selectedAmenities.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleToggleAmenity(name)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 shadow-2xs",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-card hover:bg-muted text-foreground border-border"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    {name}
                  </button>
                );
              })}
            </div>

            {/* Custom Amenity Adder */}
            <div className="flex items-center gap-2 max-w-sm pt-2">
              <Input
                placeholder="Add custom amenity..."
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomAmenity();
                  }
                }}
                className="text-xs h-8"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8"
                onClick={handleAddCustomAmenity}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" size="sm" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>
        <Button type="submit" form="wizard-step-2" size="sm">
          Continue to Photos
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
