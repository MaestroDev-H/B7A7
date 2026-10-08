"use client";

import * as React from "react";

export interface UsePaginationOptions {
  totalItems: number;
  initialPage?: number;
  pageSize?: number;
}

export function usePagination({
  totalItems,
  initialPage = 1,
  pageSize = 10,
}: UsePaginationOptions) {
  const [page, setPage] = React.useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const nextPage = () => setPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const goToPage = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return {
    page,
    totalPages,
    pageSize,
    nextPage,
    prevPage,
    goToPage,
    startIndex,
    endIndex,
  };
}
