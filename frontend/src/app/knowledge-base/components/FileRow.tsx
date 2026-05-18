import React from "react";
import {
  FeatherAlertCircle,
  FeatherCheckCircle,
  FeatherFileCode,
  FeatherFileSpreadsheet,
  FeatherFileText,
  FeatherLoader,
  FeatherTrash2,
} from "@subframe/core";
import type { FileInfo } from "@/lib/types";
import { formatSize, getExt, simulateChunks, simulateDate } from "./utils";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface FileRowProps {
  file: FileInfo;
  onDelete?: (name: string) => void;
}

function TypePill({ ext }: { ext: string }) {
  const color =
    ext === "PDF"              ? "#f05070" :
    ext === "DOCX" || ext === "DOC" ? "#2563eb" :
    ext === "CSV"              ? "#3a9a4a" :
    ext === "TXT"              ? "#c47800" :
    "#474747";

  return (
    <span style={{
      fontSize: 10,
      fontFamily: MONO,
      letterSpacing: "0.1em",
      color,
      border: `1px solid ${color}`,
      borderRadius: 9999,
      padding: "2px 8px",
      opacity: 0.85,
    }}>
      {ext}
    </span>
  );
}

function StatusPill({ status }: { status: FileInfo["status"] }) {
  const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    ingested:  { label: "Ready",      color: "#3a9a4a", icon: <FeatherCheckCircle style={{ width: 11, height: 11 }} /> },
    ingesting: { label: "Processing", color: "#2563eb", icon: <FeatherLoader      style={{ width: 11, height: 11 }} /> },
    uploading: { label: "Uploading",  color: "#2563eb", icon: <FeatherLoader      style={{ width: 11, height: 11 }} /> },
    error:     { label: "Error",      color: "#f05070", icon: <FeatherAlertCircle style={{ width: 11, height: 11 }} /> },
  };
  const s = map[status] ?? { label: "Uploaded", color: "#474747", icon: null };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontFamily: MONO, letterSpacing: "0.1em", color: s.color, border: `1px solid ${s.color}`, borderRadius: 9999, padding: "2px 8px", opacity: 0.85 }}>
      {s.icon}{s.label}
    </span>
  );
}

const CELL: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #1f2228",
  verticalAlign: "middle",
  fontSize: 14,
  fontFamily: FONT,
  letterSpacing: "-0.025em",
  lineHeight: 1.43,
  color: "#7d8187",
  whiteSpace: "nowrap",
};

export function FileRow({ file, onDelete }: FileRowProps) {
  const ext = getExt(file.name);
  const FileIcon = ext === "CSV" ? FeatherFileSpreadsheet : ext === "MD" ? FeatherFileCode : FeatherFileText;
  const iconColor =
    ext === "PDF"              ? "#f05070" :
    ext === "DOCX" || ext === "DOC" ? "#2563eb" :
    ext === "CSV"              ? "#3a9a4a" :
    ext === "TXT"              ? "#c47800" :
    "#474747";

  return (
    <tr
      style={{ transition: "background 0.12s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2228")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ ...CELL, maxWidth: 260 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileIcon style={{ width: 15, height: 15, color: iconColor, flexShrink: 0 }} />
          <span style={{ color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em" }}>
            {file.name}
          </span>
        </div>
      </td>
      <td style={CELL}><TypePill ext={ext} /></td>
      <td style={CELL}>{formatSize(file.size)}</td>
      <td style={CELL}>{simulateDate(file)}</td>
      <td style={CELL}><StatusPill status={file.status} /></td>
      <td style={{ ...CELL, fontFamily: MONO, letterSpacing: "0.1em", fontSize: 12 }}>{simulateChunks(file)}</td>
      <td style={{ ...CELL, textAlign: "right" }}>
        {onDelete && (
          <button
            onClick={() => onDelete(file.name)}
            style={{ background: "none", border: "none", color: "#474747", cursor: "pointer", padding: 4, display: "inline-flex", alignItems: "center", borderRadius: 4, transition: "color 0.15s" }}
            aria-label={`Delete ${file.name}`}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f05070")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#474747")}
          >
            <FeatherTrash2 style={{ width: 14, height: 14 }} />
          </button>
        )}
      </td>
    </tr>
  );
}
