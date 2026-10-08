"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Check, Building2, MapPin, ImageIcon, BedDouble, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePropertyWizardStore } from "@/stores/property-wizard-store";
import { cn } from "@/lib/utils";

// Lazy-load wizard steps with next/dynamic
const StepBasics = dynamic(
  () => import("@/components/features/owner/wizard/StepBasics"),
  { ssr: false, loading: () => <WizardSkeleton /> }
);
const StepLocation = dynamic(
  () => import("@/components/features/owner/wizard/StepLocation"),
  { ssr: false, loading: () => <WizardSkeleton /> }
);
const StepPhotos = dynamic(
  () => import("@/components/features/owner/wizard/StepPhotos"),
  { ssr: false, loading: () => <WizardSkeleton /> }
);
const StepRooms = dynamic(
  () => import("@/components/features/owner/wizard/StepRooms"),
  { ssr: false, loading: () => <WizardSkeleton /> }
);
const StepReview = dynamic(
  () => import("@/components/features/owner/wizard/StepReview"),
  { ssr: false, loading: () => <WizardSkeleton /> }
);

function WizardSkeleton() {
  return (
    <Card className="h-96 p-8 animate-pulse bg-muted/30 border flex items-center justify-center">
      <div className="space-y-3 text-center">
        <div className="w-10 h-10 rounded-full bg-muted mx-auto" />
        <div className="h-4 w-32 bg-muted rounded mx-auto" />
      </div>
    </Card>
  );
}

const STEPS = [
  { id: 1, name: "Basics", icon: Building2 },
  { id: 2, name: "Location & Amenities", icon: MapPin },
  { id: 3, name: "Photos", icon: ImageIcon },
  { id: 4, name: "Room Units", icon: BedDouble },
  { id: 5, name: "Review & Publish", icon: CheckCircle2 },
];

export function PropertyWizard() {
  const { currentStep, setStep } = usePropertyWizardStore();

  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Desktop Stepper (md+) */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-300 z-0"
            style={{ width: `${progressPercent}%` }}
          />

          {STEPS.map((step) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  // Allow clicking back to completed steps
                  if (step.id < currentStep) {
                    setStep(step.id);
                  }
                }}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shadow-xs",
                    isCompleted
                      ? "bg-primary text-primary-foreground border-primary"
                      : isCurrent
                      ? "bg-background text-primary border-primary ring-4 ring-primary/10"
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium mt-2 transition-colors text-center",
                    isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper Header (< md) */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-primary uppercase tracking-wider font-mono">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="font-medium text-foreground">{STEPS[currentStep - 1]?.name}</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />
      </div>

      {/* Step Render Area */}
      <div className="pt-2">
        {currentStep === 1 && <StepBasics />}
        {currentStep === 2 && <StepLocation />}
        {currentStep === 3 && <StepPhotos />}
        {currentStep === 4 && <StepRooms />}
        {currentStep === 5 && <StepReview />}
      </div>
    </div>
  );
}
