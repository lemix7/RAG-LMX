"use client";

import { FeatherDatabase, FeatherPlus } from "@subframe/core";
import type { FileInfo } from "@/lib/types";
import { FileRow } from "./FileRow";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

const HEADERS = ["File Name", "Type", "Size", "Date Uploaded", "Status", "Chunks", ""];

interface FileTableProps {
  files: FileInfo[];
  filtered: FileInfo[];
  pageFiles: FileInfo[];
  onDelete: (name: string) => void;
  onClearFilters: () => void;
  onAddFile: () => void;
}

export function FileTable({ files, filtered, pageFiles, onDelete, onClearFilters, onAddFile }: FileTableProps) {
  if (files.length === 0) {
    return (
      <div style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "64px 32px", textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1f2228", border: "1px solid #474747", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FeatherDatabase style={{ width: 20, height: 20, color: "#ffffff" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>No files yet</span>
          <span style={{ fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", lineHeight: 1.43, color: "#7d8187", maxWidth: 280 }}>
            Upload PDF, DOCX, TXT, CSV, or MD files to build your knowledge base.
          </span>
        </div>
        <button
          onClick={onAddFile}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: "#ffffff", color: "#0c0c0b", border: "none", borderRadius: 9999, fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", cursor: "pointer", transition: "opacity 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <FeatherPlus style={{ width: 14, height: 14 }} /> Add your first file
        </button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "48px 32px", textAlign: "center" }}>
        <span style={{ fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>No files match your search</span>
        <button
          onClick={onClearFilters}
          style={{ padding: "6px 16px", background: "transparent", border: "1px solid #1f2228", borderRadius: 9999, fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", cursor: "pointer", transition: "border-color 0.15s, color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.color = "#ffffff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#7d8187"; }}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: "#0c0c0b" }}>
          {HEADERS.map((h, i) => (
            <th key={i} style={{
              padding: "10px 16px",
              textAlign: i === HEADERS.length - 1 ? "right" : "left",
              fontSize: 12,
              fontFamily: MONO,
              letterSpacing: "0.1em",
              color: "#474747",
              fontWeight: 400,
              borderBottom: "1px solid #1f2228",
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {pageFiles.map((file, i) => (
          <FileRow key={file.name} file={file} onDelete={onDelete} index={i} />
        ))}
      </tbody>
    </table>
  );
}
