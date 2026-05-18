"use client";

import { useState } from "react";
import { FeatherSearch } from "@subframe/core";
import type { FilterType } from "./utils";
import { FILTER_TYPES } from "./utils";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface FileToolbarProps {
  search: string;
  filter: FilterType;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FilterType) => void;
}

export function FileToolbar({ search, filter, onSearchChange, onFilterChange }: FileToolbarProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", width: "100%", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      {/* Search — border-color only on focus per DESIGN.md (no box-shadow) */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: 240, flexShrink: 0 }}>
        <span style={{ position: "absolute", left: 14, color: "#474747", display: "flex", alignItems: "center", pointerEvents: "none" }}>
          <FeatherSearch style={{ width: 13, height: 13 }} />
        </span>
        <input
          type="text"
          placeholder="Search files…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "#0c0c0b",
            color: "#ffffff",
            border: `1px solid ${focused ? "#2563eb" : "#1f2228"}`,
            borderRadius: 9999,
            padding: "8px 14px 8px 34px",
            fontSize: 14,
            fontFamily: FONT,
            letterSpacing: "-0.025em",
            lineHeight: 1.43,
            outline: "none",
            transition: "border-color 0.15s",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#474747"; }}
          onMouseLeave={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#1f2228"; }}
        />
      </div>

      {/* Filter pills — MONO labels per DESIGN.md badge treatment */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
        {FILTER_TYPES.map((t) => {
          const active = filter === t;
          return (
            <button
              key={t}
              onClick={() => onFilterChange(t)}
              style={{
                padding: "4px 12px",
                borderRadius: 9999,
                border: `1px solid ${active ? "#2563eb" : "#1f2228"}`,
                background: active ? "#1a3568" : "transparent",
                color: active ? "#ffffff" : "#7d8187",
                fontSize: 12,
                fontFamily: MONO,
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "border-color 0.15s, color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.color = "#ffffff"; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#7d8187"; } }}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
