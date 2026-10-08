"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ArrowUpDown, Building2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hooks/use-debounce";
import type { PropertyType } from "@/lib/api/types";

const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: "Apartment", value: "APARTMENT" },
  { label: "House", value: "HOUSE" },
  { label: "Studio", value: "STUDIO" },
  { label: "Condo", value: "CONDO" },
  { label: "Villa", value: "VILLA" },
  { label: "Room", value: "ROOM" },
];

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial params
  const currentSearch = searchParams.get("search") || "";
  const currentCity = searchParams.get("city") || "";
  const currentType = searchParams.get("type") || "ALL";
  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";

  const [searchTerm, setSearchTerm] = React.useState(currentSearch);
  const [cityTerm, setCityTerm] = React.useState(currentCity);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const debouncedCity = useDebounce(cityTerm, 400);

  // Sync state if URL params change externally
  React.useEffect(() => {
    setSearchTerm(currentSearch);
  }, [currentSearch]);

  React.useEffect(() => {
    setCityTerm(currentCity);
  }, [currentCity]);

  // Helper to update search params
  const updateQuery = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "" || val === "ALL") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      // Reset page to 1 when changing filters
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounced search term effect
  React.useEffect(() => {
    if (debouncedSearch !== currentSearch) {
      updateQuery({ search: debouncedSearch || null });
    }
  }, [debouncedSearch, currentSearch, updateQuery]);

  // Debounced city effect
  React.useEffect(() => {
    if (debouncedCity !== currentCity) {
      updateQuery({ city: debouncedCity || null });
    }
  }, [debouncedCity, currentCity, updateQuery]);

  const clearAllFilters = () => {
    setSearchTerm("");
    setCityTerm("");
    router.push("/properties");
  };

  const hasActiveFilters = Boolean(
    currentSearch ||
      currentCity ||
      (currentType && currentType !== "ALL") ||
      searchParams.get("minRent") ||
      searchParams.get("maxRent")
  );

  return (
    <div className="space-y-4">
      {/* Primary Filters Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
        {/* Search Input */}
        <div className="lg:col-span-4 relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search listings by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 text-xs bg-muted/40"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* City Input */}
        <div className="lg:col-span-3 relative flex items-center">
          <Input
            placeholder="Filter by city..."
            value={cityTerm}
            onChange={(e) => setCityTerm(e.target.value)}
            className="h-10 text-xs bg-muted/40"
          />
          {cityTerm && (
            <button
              onClick={() => setCityTerm("")}
              className="absolute right-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Property Type */}
        <div className="lg:col-span-3">
          <Select
            value={currentType}
            onValueChange={(val) => updateQuery({ type: val || "ALL" })}
          >
            <SelectTrigger className="h-10 w-full text-xs bg-muted/40">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Property Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Property Types</SelectItem>
              {PROPERTY_TYPES.map((pt) => (
                <SelectItem key={pt.value} value={pt.value}>
                  {pt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort Select */}
        <div className="lg:col-span-2">
          <Select
            value={`${currentSortBy}-${currentOrder}`}
            onValueChange={(val) => {
              if (val === "createdAt-desc") updateQuery({ sortBy: "createdAt", order: "desc" });
              if (val === "createdAt-asc") updateQuery({ sortBy: "createdAt", order: "asc" });
              if (val === "title-asc") updateQuery({ sortBy: "title", order: "asc" });
              if (val === "title-desc") updateQuery({ sortBy: "title", order: "desc" });
            }}
          >
            <SelectTrigger className="h-10 w-full text-xs bg-muted/40">
              <div className="flex items-center gap-1.5 truncate">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="title-asc">Title (A &ndash; Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z &ndash; A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            Active filters:
          </span>

          {currentSearch && (
            <Badge variant="secondary" className="text-xs gap-1.5 pl-2.5 pr-1.5 py-1">
              Title: &ldquo;{currentSearch}&rdquo;
              <button onClick={() => setSearchTerm("")} className="hover:opacity-70 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentCity && (
            <Badge variant="secondary" className="text-xs gap-1.5 pl-2.5 pr-1.5 py-1">
              City: {currentCity}
              <button onClick={() => setCityTerm("")} className="hover:opacity-70 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {currentType && currentType !== "ALL" && (
            <Badge variant="secondary" className="text-xs gap-1.5 pl-2.5 pr-1.5 py-1">
              Type: {currentType}
              <button onClick={() => updateQuery({ type: null })} className="hover:opacity-70 cursor-pointer">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          <Button
            variant="ghost"
            size="xs"
            onClick={clearAllFilters}
            className="text-xs text-primary hover:underline h-7 ml-auto cursor-pointer"
          >
            Clear all filters
          </Button>
        </div>
      )}
    </div>
  );
}
