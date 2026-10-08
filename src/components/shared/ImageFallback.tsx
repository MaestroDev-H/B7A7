import * as React from "react";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  iconClassName?: string;
}

export function ImageFallback({
  label = "Nestly Living",
  className,
  iconClassName,
  ...props
}: ImageFallbackProps) {
  return (
    <div
      className={cn(
        "w-full h-full min-h-[140px] flex flex-col items-center justify-center bg-gradient-to-br from-muted/60 via-muted/40 to-muted/80 text-muted-foreground select-none p-4",
        className
      )}
      {...props}
    >
      <div className="p-3 rounded-xl bg-background/60 shadow-2xs mb-2 backdrop-blur-xs">
        <Home className={cn("h-6 w-6 text-primary/70", iconClassName)} />
      </div>
      <span className="text-xs font-medium tracking-wide uppercase font-display opacity-80">
        {label}
      </span>
    </div>
  );
}
