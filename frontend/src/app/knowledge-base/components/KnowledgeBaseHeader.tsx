"use client";

import { FeatherDatabase, FeatherLoader, FeatherPlus } from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface KnowledgeBaseHeaderProps {
  fileCount: number;
  isUploading: boolean;
  isIngesting: boolean;
  error?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadFiles: (files: FileList) => void;
  onMenuClick?: () => void;
}

export function KnowledgeBaseHeader({
  fileCount,
  isUploading,
  isIngesting,
  error,
  fileInputRef,
  onUploadFiles,
  onMenuClick,
}: KnowledgeBaseHeaderProps) {
  const busy = isUploading || isIngesting;

  return (
    <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1f2228", padding: "14px 24px", background: "#0c0c0b", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Hamburger — mobile only */}
        <button
          className="hamburger-btn md:hidden"
          onClick={onMenuClick}
          style={{ background: "none", border: "none", color: "#7d8187", cursor: "pointer", alignItems: "center", padding: 4, marginRight: 4, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#7d8187")}
          aria-label="Open sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <FeatherDatabase style={{ width: 16, height: 16, color: "#ffffff" }} />
        <span style={{ fontSize: 16, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>
          Knowledge Base
        </span>
        <span style={{
          fontSize: 11,
          fontFamily: MONO,
          letterSpacing: "0.08em",
          color: "#7d8187",
          border: "1px solid #1f2228",
          borderRadius: 9999,
          padding: "2px 8px",
        }}>
          {fileCount} files
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {error && (
          <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.06em", color: "#f05070", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {error}
          </span>
        )}
        <button
          disabled={busy}
          onClick={() => fileInputRef.current?.click()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 16px",
            background: busy ? "#1f2228" : "#ffffff",
            color: "#0c0c0b",
            border: "none",
            borderRadius: 9999,
            fontSize: 13,
            fontFamily: FONT,
            letterSpacing: "-0.025em",
            cursor: busy ? "not-allowed" : "pointer",
            opacity: busy ? 0.6 : 1,
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { if (!busy) e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={(e) => { if (!busy) e.currentTarget.style.opacity = "1"; }}
        >
          {busy
            ? <FeatherLoader style={{ width: 14, height: 14, animation: "spin 0.8s linear infinite" }} />
            : <FeatherPlus style={{ width: 14, height: 14 }} />
          }
          {isUploading ? "Uploading…" : isIngesting ? "Processing…" : "Add Files"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt,.md,.csv"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files) onUploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
