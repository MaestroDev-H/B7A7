"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePropertyWizardStore } from "@/stores/property-wizard-store";
import type { PropertyType } from "@/lib/api/types";

const basicsSchema = z.object({
  title: z.string().min(3, "Property title must be at least 3 characters"),
  type: z.enum(["APARTMENT", "HOUSE", "STUDIO", "CONDO", "VILLA", "ROOM"] as const),
  description: z.string().min(10, "Please provide a description of at least 10 characters"),
});

type BasicsFormData = z.infer<typeof basicsSchema>;

export default function StepBasics() {
  const { title, type, description, updateBasics, nextStep } = usePropertyWizardStore();

  const form = useForm<BasicsFormData>({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      title,
      type,
      description,
    },
  });

  const onSubmit = (data: BasicsFormData) => {
    updateBasics({
      title: data.title,
      type: data.type as PropertyType,
      description: data.description,
    });
    nextStep();
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg">Step 1: Property Basics</CardTitle>
        <CardDescription className="text-xs">
          Provide the main listing title, housing category, and an inviting description for renters.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id="wizard-step-1" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 text-xs">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Property Title</label>
            <Input
              placeholder="e.g. Modern Sunset Apartment near Tech Hub"
              className="text-xs"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-[11px] text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Property Type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Property Type</label>
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="STUDIO">Studio</SelectItem>
                    <SelectItem value="CONDO">Condo</SelectItem>
                    <SelectItem value="VILLA">Villa</SelectItem>
                    <SelectItem value="ROOM">Individual Room</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Overview & Description</label>
            <Textarea
              placeholder="Highlight property amenities, proximity to public transit, neighborhood vibe, and house rules..."
              rows={5}
              className="text-xs"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-[11px] text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end border-t pt-4">
        <Button type="submit" form="wizard-step-1" size="sm">
          Continue to Location
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
