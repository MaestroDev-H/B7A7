"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { type z } from "zod";

/**
 * URL-state syncing hook that reads and writes query params with Zod validation.
 * Automatically resets page to 1 when any filter other than page changes.
 */
export function useListParams<T extends z.ZodTypeAny>(schema: T) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = React.useTransition();

  // Convert URLSearchParams to a plain object
  const currentParams = React.useMemo(() => {
    const raw: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      raw[key] = val;
    });

    const parsed = schema.safeParse(raw);
    if (parsed.success) {
      return parsed.data as z.infer<T>;
    }
    return raw as z.infer<T>;
  }, [searchParams, schema]);

  const setParams = React.useCallback(
    (newParams: Partial<z.infer<T>>, options?: { resetPage?: boolean }) => {
      const next = new URLSearchParams(searchParams.toString());

      const shouldResetPage =
        options?.resetPage !== false &&
        Object.keys(newParams).some((k) => k !== "page");

      if (shouldResetPage) {
        next.set("page", "1");
      }

      for (const [k, v] of Object.entries(newParams)) {
        if (v === undefined || v === null || v === "" || v === "ALL") {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      }

      startTransition(() => {
        const query = next.toString();
        router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
      });
    },
    [searchParams, pathname, router]
  );

  const resetFilters = React.useCallback(() => {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }, [pathname, router]);

  return {
    params: currentParams,
    setParams,
    resetFilters,
    isPending,
  };
}
