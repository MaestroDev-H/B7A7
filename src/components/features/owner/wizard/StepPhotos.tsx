"use client";

import * as React from "react";
import { useState } from "react";
import { ArrowLeft, ArrowRight, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/shared/ImageUploader";
import { usePropertyWizardStore } from "@/stores/property-wizard-store";
import { toast } from "sonner";

export default function StepPhotos() {
  const { images, updateImages, nextStep, prevStep } = usePropertyWizardStore();
  const [photoList, setPhotoList] = useState<string[]>(images || []);

  const handleNext = () => {
    if (photoList.length === 0) {
      toast.error("Please upload at least 1 photo of your property");
      return;
    }
    updateImages(photoList);
    nextStep();
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <CardTitle className="text-lg">Step 3: Property Photos</CardTitle>
        <CardDescription className="text-xs">
          High-quality photos increase viewing requests by 3x. Upload up to 6 photos (exterior, common areas, rooms).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <ImageUploader
          value={photoList}
          onChange={setPhotoList}
          folder="properties"
          maxFiles={6}
          description="The first image will be used as the listing cover. Drag & drop or reorder as desired."
        />
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <Button type="button" variant="outline" size="sm" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back
        </Button>
        <Button type="button" size="sm" onClick={handleNext}>
          Continue to Rooms
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
