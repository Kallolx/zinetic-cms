"use client";

import { Button } from "@/components/ui/button";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export function TablePagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <p className="text-sm text-muted-foreground">
        Page {page} of {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <LuChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <LuChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
