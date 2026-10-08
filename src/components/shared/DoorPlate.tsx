import * as React from "react";
import { cn } from "@/lib/utils";

export interface DoorPlateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The room number or suite code (e.g. "Room 102", "A-3", "204")
   */
  roomNumber: string | number;
  /**
   * Visual size variant
   */
  size?: "sm" | "md" | "lg";
  /**
   * Optional subtext such as "Private" or "En-suite"
   */
  subtitle?: string;
}

/**
 * DoorPlate - Signature engraved brass room plate element.
 * Symbolizes warm, boutique residential living spaces.
 */
export function DoorPlate({
  roomNumber,
  size = "md",
  subtitle,
  className,
  ...props
}: DoorPlateProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs tracking-wider gap-1",
    md: "px-3 py-1 text-sm tracking-widest gap-1.5",
    lg: "px-4 py-2 text-base tracking-widest gap-2 font-bold",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center font-display uppercase select-none rounded-sm border shadow-xs transition-all",
        "bg-gradient-to-b from-[#e8cf7a] via-[#c9a03d] to-[#9b7823]",
        "dark:from-[#deb94d] dark:via-[#af8523] dark:to-[#785b13]",
        "border-[#7d5d14] text-[#2c1e05] dark:text-[#181103]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.15)]",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {/* Decorative brass screw left */}
      <span className="h-1.5 w-1.5 rounded-full bg-[#5c420b] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.3)] opacity-70" />
      <span className="font-semibold text-shadow-xs drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.4)]">
        {roomNumber}
      </span>
      {subtitle && (
        <span className="text-[0.7em] opacity-80 font-normal tracking-normal lowercase border-l border-[#7d5d14]/30 pl-1">
          {subtitle}
        </span>
      )}
      {/* Decorative brass screw right */}
      <span className="h-1.5 w-1.5 rounded-full bg-[#5c420b] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.3)] opacity-70" />
    </div>
  );
}
