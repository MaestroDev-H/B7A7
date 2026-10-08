"use client";

import * as React from "react";
import { useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, X, ArrowLeft, ArrowRight, Loader2, Image as ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { clientFetch } from "@/lib/api/http.client";
import { uploadsService } from "@/lib/api/services/uploads";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ImageUploaderProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  folder?: string;
  maxFiles?: number;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  previewUrl: string;
  error?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_DIMENSION = 1600;
const TARGET_MAX_BYTES = 4 * 1024 * 1024; // 4MB

/**
 * Resizes and compresses image via HTML Canvas before upload
 */
async function compressImage(file: File): Promise<File> {
  // If already under 1MB and dimension check passes, return directly if not oversized
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Determine target format (keep WebP or convert to JPEG)
        const format = file.type === "image/webp" ? "image/webp" : "image/jpeg";
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
              type: format,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          format,
          0.85
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export function ImageUploader({
  value = [],
  onChange,
  folder = "nestly",
  maxFiles = 5,
  maxSizeMb = 10,
  disabled = false,
  className,
  label,
  description,
}: ImageUploaderProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [, startTransition] = useTransition();

  const currentUrls = Array.isArray(value) ? value : [];
  const canUploadMore = currentUrls.length + uploadingFiles.length < maxFiles;

  const handleFiles = async (files: FileList | File[]) => {
    if (disabled || !canUploadMore) return;

    const fileList = Array.from(files);
    const availableSlots = maxFiles - (currentUrls.length + uploadingFiles.length);
    const selected = fileList.slice(0, availableSlots);

    for (const rawFile of selected) {
      if (!ALLOWED_TYPES.includes(rawFile.type)) {
        toast.error(`"${rawFile.name}" is not a supported image format (JPEG, PNG, WebP, AVIF)`);
        continue;
      }

      if (rawFile.size > maxSizeMb * 1024 * 1024) {
        toast.error(`"${rawFile.name}" exceeds ${maxSizeMb}MB`);
        continue;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const previewUrl = URL.createObjectURL(rawFile);

      setUploadingFiles((prev) => [
        ...prev,
        { id: fileId, name: rawFile.name, progress: 5, previewUrl },
      ]);

      try {
        // Compress client-side
        const processedFile = await compressImage(rawFile);

        const res = await uploadsService.uploadFile(
          clientFetch,
          processedFile,
          folder,
          (percent) => {
            setUploadingFiles((prev) =>
              prev.map((f) => (f.id === fileId ? { ...f, progress: Math.max(10, percent) } : f))
            );
          }
        );

        // Success - remove from uploading and add to value
        setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId));
        URL.revokeObjectURL(previewUrl);

        if (res?.url) {
          const nextUrls = [...currentUrls, res.url];
          startTransition(() => {
            onChange?.(nextUrls);
          });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Upload failed";
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, error: errorMsg } : f))
        );
        toast.error(`Failed to upload ${rawFile.name}: ${errorMsg}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled && canUploadMore) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeUrl = (index: number) => {
    const next = currentUrls.filter((_, i) => i !== index);
    onChange?.(next);
  };

  const moveUrl = (from: number, to: number) => {
    if (to < 0 || to >= currentUrls.length) return;
    const copy = [...currentUrls];
    const [item] = copy.splice(from, 1);
    if (item !== undefined) {
      copy.splice(to, 0, item);
      onChange?.(copy);
    }
  };

  const cancelUpload = (id: string, previewUrl: string) => {
    URL.revokeObjectURL(previewUrl);
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
          <span className="text-xs text-muted-foreground font-mono">
            {currentUrls.length}/{maxFiles} max
          </span>
        </div>
      )}

      {/* Upload Dropzone */}
      {canUploadMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label={label || "Upload images"}
          className={cn(
            "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border hover:border-primary/50 hover:bg-muted/40 bg-card",
            disabled && "opacity-50 cursor-not-allowed pointer-events-none"
          )}
        >
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={ALLOWED_TYPES.join(",")}
            className="sr-only"
            disabled={disabled || !canUploadMore}
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />

          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP, AVIF (auto-optimized to ≤4MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {/* Live Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2" aria-live="polite">
          {uploadingFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-muted/50 border border-border/80 rounded-lg text-xs"
            >
              <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 bg-background border">
                <Image
                  src={file.previewUrl}
                  alt={file.name}
                  fill
                  sizes="40px"
                  className="object-cover opacity-70"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span className="truncate font-medium text-foreground">{file.name}</span>
                  <span className="font-mono">{file.progress}%</span>
                </div>
                <Progress value={file.progress} className="h-1.5" />
                {file.error && (
                  <p className="text-destructive text-[11px] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {file.error}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => cancelUpload(file.id, file.previewUrl)}
              >
                <X className="w-3.5 h-3.5" />
                <span className="sr-only">Cancel upload</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Previews / Thumbnail Grid */}
      {currentUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
          {currentUrls.map((url, idx) => (
            <div
              key={url + idx}
              className="group relative aspect-4/3 rounded-lg overflow-hidden border bg-muted/20 shadow-xs"
            >
              <Image
                src={url}
                alt={`Image ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105 duration-200"
              />

              {/* Cover badge for first image */}
              {idx === 0 && (
                <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-background/90 backdrop-blur-xs text-[10px] font-medium border text-foreground shadow-xs">
                  Cover
                </div>
              )}

              {/* Hover / Focus Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    className="h-7 w-7 rounded-full bg-background/90 text-foreground hover:bg-background"
                    onClick={() => moveUrl(idx, idx - 1)}
                    title="Move left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="sr-only">Move image earlier</span>
                  </Button>
                )}
                {idx < currentUrls.length - 1 && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    className="h-7 w-7 rounded-full bg-background/90 text-foreground hover:bg-background"
                    onClick={() => moveUrl(idx, idx + 1)}
                    title="Move right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span className="sr-only">Move image later</span>
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  className="h-7 w-7 rounded-full"
                  onClick={() => removeUrl(idx)}
                  title="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="sr-only">Remove image</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
