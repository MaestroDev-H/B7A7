"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  onClear?: () => void;
}

export function SearchInput({
  value,
  onChange,
  debounceMs = 300,
  onClear,
  placeholder = "Search...",
  className,
  ...props
}: SearchInputProps) {
  const [internalValue, setInternalValue] = React.useState(value);
  const [prevValue, setPrevValue] = React.useState(value);

  // React-recommended pattern for adjusting state from props during render
  if (prevValue !== value) {
    setPrevValue(value);
    setInternalValue(value);
  }

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [internalValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative flex items-center w-full max-w-sm", className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 h-9 bg-card border-border/80 focus-visible:ring-primary/20 text-sm shadow-2xs"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
