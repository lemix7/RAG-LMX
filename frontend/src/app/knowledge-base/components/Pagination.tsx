"use client";

import { Button } from "@/ui/components/Button";
import { FeatherChevronLeft, FeatherChevronRight } from "@subframe/core";
import { ITEMS_PER_PAGE } from "./utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex w-full items-center justify-between">
      <span className="text-caption font-caption text-subtext-color">
        Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
        {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} files
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="neutral-secondary"
          size="small"
          icon={<FeatherChevronLeft />}
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-7 w-7 flex-none items-center justify-center rounded-[4px] ${
                p === currentPage ? "bg-brand-600" : "hover:bg-neutral-100"
              }`}
            >
              <span
                className={`text-caption font-caption ${
                  p === currentPage
                    ? "text-default-background font-caption-bold"
                    : "text-subtext-color"
                }`}
              >
                {p}
              </span>
            </button>
          ))}
        </div>

        <Button
          variant="neutral-secondary"
          size="small"
          iconRight={<FeatherChevronRight />}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
