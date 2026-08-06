"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import {
  getPageNumbers,
  getSafePage,
  getShowingRange,
  getTotalPages,
  LIST_PAGE_SIZE,
} from "@/lib/pagination";

export function ListPagination({
  page,
  totalItems,
  onPageChange,
  label,
  pageSize = LIST_PAGE_SIZE,
}: {
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  label: string;
  pageSize?: number;
}) {
  const totalPages = getTotalPages(totalItems, pageSize);
  const currentPage = getSafePage(page, totalItems, pageSize);
  const pages = getPageNumbers(totalPages);
  const range = getShowingRange(currentPage, totalItems, pageSize);
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  let showingLabel = `Mostrando 0 de ${totalItems} ${label}`;
  if (totalItems > 0) {
    showingLabel = `Mostrando ${range.from}–${range.to} de ${totalItems} ${label}`;
  }

  return (
    <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4 text-xs text-zinc-500">
      <span>{showingLabel}</span>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!canGoPrev}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
        </Button>
        {pages.map((pageNumber) => {
          let variant: "default" | "outline" = "outline";
          if (pageNumber === currentPage) {
            variant = "default";
          }

          return (
            <Button
              key={pageNumber}
              variant={variant}
              size="icon"
              className="size-8"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          );
        })}
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
