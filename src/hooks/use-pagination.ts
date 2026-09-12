"use client";

import * as React from "react";

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = React.useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  // clamp without an effect: if the list shrank (e.g. a search filter),
  // just render the last valid page instead of an empty one
  const safePage = Math.min(page, pageCount);

  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { page: safePage, setPage, pageCount, pageItems };
}
