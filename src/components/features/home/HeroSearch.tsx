"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PropertyType } from "@/lib/api/types";

const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: "Apartment", value: "APARTMENT" },
  { label: "House", value: "HOUSE" },
  { label: "Studio", value: "STUDIO" },
  { label: "Condo", value: "CONDO" },
  { label: "Villa", value: "VILLA" },
  { label: "Room", value: "ROOM" },
];

export function HeroSearch() {
  const router = useRouter();
  const [city, setCity] = React.useState("");
  const [propertyType, setPropertyType] = React.useState<string>("ALL");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) {
      params.set("city", city.trim());
    }
    if (propertyType && propertyType !== "ALL") {
      params.set("type", propertyType);
    }
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="p-2 sm:p-3 rounded-2xl bg-background/90 backdrop-blur-md border border-border shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 max-w-2xl w-full"
    >
      {/* City Search */}
      <div className="sm:col-span-5 relative flex items-center">
        <MapPin className="absolute left-3.5 h-4 w-4 text-primary pointer-events-none" />
        <Input
          type="text"
          placeholder="Enter city (e.g. San Francisco)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="pl-10 h-12 bg-muted/40 border-border text-sm rounded-xl"
        />
      </div>

      {/* Property Type Select */}
      <div className="sm:col-span-4 flex items-center">
        <Select value={propertyType} onValueChange={(val) => setPropertyType(val || "ALL")}>
          <SelectTrigger className="h-12 w-full bg-muted/40 border-border text-sm rounded-xl">
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Property Type" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All Types</SelectItem>
            {PROPERTY_TYPES.map((pt) => (
              <SelectItem key={pt.value} value={pt.value}>
                {pt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Button */}
      <div className="sm:col-span-3 flex items-center">
        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-sm font-semibold shadow-sm"
        >
          <Search className="h-4 w-4 mr-1.5" />
          Search
        </Button>
      </div>
    </form>
  );
}
