import { describe, it, expect } from "vitest";
import { formatMoney, toISODateTime, formatDate, enumLabel } from "@/lib/format";
import { paginate, applyFilters } from "@/lib/utils/pagination";
import { applyServerErrors } from "@/lib/utils/form";
import { ApiError } from "@/lib/api/errors";
import type { UseFormReturn, FieldValues } from "react-hook-form";

describe("Formatting Utilities", () => {
  it("formats monetary values safely in USD", () => {
    expect(formatMoney(1200)).toBe("$1,200.00");
    expect(formatMoney("1550.50")).toBe("$1,550.50");
    expect(formatMoney(0)).toBe("$0.00");
    expect(formatMoney(null)).toBe("$0.00");
    expect(formatMoney(undefined)).toBe("$0.00");
    expect(formatMoney("invalid")).toBe("$0.00");
  });

  it("converts date to strict ISO string with Z", () => {
    const iso = toISODateTime("2026-10-15");
    expect(iso).toContain("2026-10-15");
    expect(iso.endsWith("Z")).toBe(true);
  });

  it("formats dates gracefully", () => {
    expect(formatDate("2026-10-15T12:00:00.000Z")).toContain("2026");
    expect(formatDate(null)).toBe("N/A");
  });

  it("formats enum labels to human readable title case", () => {
    expect(enumLabel("UNDER_MAINTENANCE")).toBe("Under maintenance");
    expect(enumLabel("IN_PROGRESS")).toBe("In progress");
    expect(enumLabel("ACTIVE")).toBe("Active");
  });
});

describe("Pagination and Filter Utilities", () => {
  const sampleItems = [
    { id: "1", title: "Luxury Suite A", city: "Seattle", rentAmount: 1200, status: "AVAILABLE" },
    { id: "2", title: "Modern Studio", city: "Bellevue", rentAmount: 950, status: "OCCUPIED" },
    { id: "3", title: "Downtown Apartment", city: "Seattle", rentAmount: 1800, status: "AVAILABLE" },
    { id: "4", title: "Cozy Room", city: "Redmond", rentAmount: 700, status: "AVAILABLE" },
  ];

  it("paginates arrays correctly", () => {
    const page1 = paginate(sampleItems, 1, 2);
    expect(page1.data.length).toBe(2);
    expect(page1.meta.totalPages).toBe(2);
    expect(page1.meta.total).toBe(4);
    expect(page1.data[0]?.id).toBe("1");

    const page2 = paginate(sampleItems, 2, 2);
    expect(page2.data.length).toBe(2);
    expect(page2.data[0]?.id).toBe("3");
  });

  it("filters items by search, city, and status", () => {
    const filteredCity = applyFilters(sampleItems, { city: "Seattle" });
    expect(filteredCity.length).toBe(2);

    const filteredStatus = applyFilters(sampleItems, { status: "OCCUPIED" });
    expect(filteredStatus.length).toBe(1);
    expect(filteredStatus[0]?.title).toBe("Modern Studio");

    const filteredSearch = applyFilters(sampleItems, { search: "studio" });
    expect(filteredSearch.length).toBe(1);

    const filteredPrice = applyFilters(sampleItems, { minPrice: 1000, maxPrice: 1500 });
    expect(filteredPrice.length).toBe(1);
    expect(filteredPrice[0]?.id).toBe("1");
  });
});

describe("Form Error Mapping Utility", () => {
  it("maps ApiError field errors to React Hook Form setError", () => {
    const errorsSet: Record<string, { type: string; message: string }> = {};
    const mockForm = {
      setError: (field: string, errorObj: { type: string; message: string }) => {
        errorsSet[field] = errorObj;
      },
    } as unknown as UseFormReturn<FieldValues>;

    const apiError = new ApiError("Validation failed", 422, [
      { field: "email", message: "Email already taken" },
      { field: "password", message: "Password is too weak" },
    ]);

    applyServerErrors(mockForm, apiError);

    expect(errorsSet.email).toBeDefined();
    expect(errorsSet.email?.message).toBe("Email already taken");
    expect(errorsSet.password?.message).toBe("Password is too weak");
  });
});
