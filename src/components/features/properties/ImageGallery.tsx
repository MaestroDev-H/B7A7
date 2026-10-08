"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageFallback } from "@/components/shared/ImageFallback";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const validImages = images && images.length > 0 ? images : [];
  const currentImage = validImages[activeIndex];

  const handlePrev = React.useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
  }, [validImages.length]);

  const handleNext = React.useCallback(() => {
    setActiveIndex((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
  }, [validImages.length]);

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext]);

  if (validImages.length === 0) {
    return (
      <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-muted border border-border">
        <ImageFallback className="h-full w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Showcase Image */}
      <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-muted border border-border group shadow-md">
        {currentImage && (
          <Image
            src={currentImage}
            alt={`${title} - Photo ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 800px"
            className="object-cover transition-all duration-300"
          />
        )}

        {/* Carousel Prev/Next Overlay Buttons */}
        {validImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full opacity-80 group-hover:opacity-100 backdrop-blur-md bg-background/80 shadow-md cursor-pointer"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full opacity-80 group-hover:opacity-100 backdrop-blur-md bg-background/80 shadow-md cursor-pointer"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Photo Counter Pill */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-xs font-medium backdrop-blur-md bg-slate-900/80 text-white shadow-xs">
              {activeIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`relative h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                activeIndex === idx
                  ? "border-primary ring-2 ring-primary/20 scale-102"
                  : "border-border opacity-70 hover:opacity-100"
              }`}
              aria-label={`Show photo ${idx + 1}`}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
