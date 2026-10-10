import * as React from "react";
import { Search, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  return (
    <form
      action="/properties"
      method="GET"
      className="p-2 sm:p-3 rounded-2xl bg-background/90 backdrop-blur-md border border-border shadow-xl grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 max-w-2xl w-full"
    >
      {/* City Search */}
      <div className="sm:col-span-5 relative flex items-center">
        <MapPin className="absolute left-3.5 h-4 w-4 text-primary pointer-events-none" />
        <Input
          type="text"
          name="city"
          placeholder="Enter city (e.g. Sylhet)"
          className="pl-10 h-12 bg-muted/40 border-border text-sm rounded-xl"
        />
      </div>

      {/* Property Type Select */}
      <div className="sm:col-span-4 flex items-center">
        <div className="relative w-full flex items-center">
          <Building2 className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <select
            name="type"
            defaultValue="ALL"
            className="h-12 w-full pl-10 pr-4 bg-muted/40 border border-border text-sm rounded-xl appearance-none text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">All Types</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt.value} value={pt.value} className="bg-popover text-popover-foreground">
                {pt.label}
              </option>
            ))}
          </select>
        </div>
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
