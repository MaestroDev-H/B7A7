/**
 * Paginate an array of items in-memory for client-filtered endpoints.
 */
export function paginate<T>(
  items: T[] | null | undefined,
  page = 1,
  limit = 10
): {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} {
  if (!items || !Array.isArray(items)) {
    return {
      data: [],
      meta: { page: 1, limit, total: 0, totalPages: 0 },
    };
  }

  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const total = items.length;
  const totalPages = Math.ceil(total / safeLimit);
  const offset = (safePage - 1) * safeLimit;
  const data = items.slice(offset, offset + safeLimit);

  return {
    data,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
    },
  };
}

/**
 * Apply filtering criteria to an array of objects
 */
export function applyFilters<T extends Record<string, unknown>>(
  items: T[] | null | undefined,
  filters: {
    search?: string;
    searchFields?: (keyof T)[];
    status?: string;
    type?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    priceField?: keyof T;
    [key: string]: unknown;
  }
): T[] {
  if (!items || !Array.isArray(items)) return [];

  return items.filter((item) => {
    // 1. Search filter across designated fields
    if (filters.search && filters.search.trim()) {
      const term = filters.search.trim().toLowerCase();
      const fields = filters.searchFields || (["title", "name", "roomNumber", "address", "city"] as (keyof T)[]);
      const matchesSearch = fields.some((field) => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(term);
      });
      if (!matchesSearch) return false;
    }

    // 2. Exact status match
    if (filters.status && filters.status !== "ALL") {
      if (item.status !== filters.status) return false;
    }

    // 3. Exact type match
    if (filters.type && filters.type !== "ALL") {
      if (item.type !== filters.type) return false;
    }

    // 4. City match
    if (filters.city && filters.city !== "ALL") {
      if (item.city && String(item.city).toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
    }

    // 5. Price bounds
    const priceKey = filters.priceField || ("rentAmount" as keyof T);
    if (item[priceKey] !== undefined) {
      const price = Number(item[priceKey]);
      if (filters.minPrice !== undefined && price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    }

    return true;
  });
}
