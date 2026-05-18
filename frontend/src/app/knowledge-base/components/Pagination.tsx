"use client";

import { FeatherChevronLeft, FeatherChevronRight } from "@subframe/core";
import { ITEMS_PER_PAGE } from "./utils";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const NavBtn = ({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "5px 12px",
        background: "transparent",
        border: "1px solid #1f2228",
        borderRadius: 9999,
        color: disabled ? "#a0a4ab" : "#a0a4ab",
        fontSize: 12,
        fontFamily: FONT,
        letterSpacing: "-0.025em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.borderColor = "#a0a4ab"; e.currentTarget.style.color = "#ffffff"; } }}
      onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#a0a4ab"; } }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#a0a4ab" }}>
        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} files
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <NavBtn onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
          <FeatherChevronLeft style={{ width: 12, height: 12 }} /> Prev
        </NavBtn>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                border: `1px solid ${p === currentPage ? "#2563eb" : "transparent"}`,
                background: p === currentPage ? "#1a3568" : "transparent",
                color: p === currentPage ? "#ffffff" : "#7d8187",
                fontSize: 12,
                fontFamily: MONO,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <NavBtn onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
          Next <FeatherChevronRight style={{ width: 12, height: 12 }} />
        </NavBtn>
      </div>
    </div>
  );
}
