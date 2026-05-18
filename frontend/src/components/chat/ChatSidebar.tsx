"use client";

import Link from "next/link";
import { SidebarFileList } from "@/components/SidebarFileList";
import {
  FeatherDatabase,
  FeatherLayoutDashboard,
  FeatherLayers,
  FeatherMessageSquare,
  FeatherSettings,
  FeatherUploadCloud,
  FeatherUser,
} from "@subframe/core";
import type { FileInfo } from "@/lib/types";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  href?: string;
}

function NavItem({ icon, label, selected, href }: NavItemProps) {
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        background: selected ? "#1f2228" : "transparent",
        color: selected ? "#ffffff" : "#a0a4ab",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        fontSize: 15,
        fontFamily: FONT,
        letterSpacing: "-0.025em",
        userSelect: "none",
      }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.background = "#1f2228"; e.currentTarget.style.color = "#ffffff"; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a0a4ab"; } }}
    >
      <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", flexShrink: 0, color: selected ? "#ffffff" : "#a0a4ab" }}>
        {icon}
      </span>
      {label}
    </div>
  );

  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  return content;
}

interface ChatSidebarProps {
  files: FileInfo[];
  isUploading: boolean;
  isIngesting: boolean;
  error?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadFiles: (files: FileList) => void;
  onDeleteFile: (name: string) => void;
  onClose?: () => void;
}

export function ChatSidebar({
  files,
  isUploading,
  isIngesting,
  error,
  fileInputRef,
  onUploadFiles,
  onDeleteFile,
  onClose,
}: ChatSidebarProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: 300,
      height: "100%",
      background: "#0c0c0b",
      borderRight: "1px solid #1f2228",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "20px 16px 16px", borderBottom: "1px solid #1f2228" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a3568", border: "1px solid #2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FeatherLayers style={{ width: 15, height: 15, color: "#ffffff" }} />
          </div>
          <span style={{ fontSize: 15, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>RAG LMX</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#7d8187", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, borderRadius: 4, transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#7d8187")}
            aria-label="Close sidebar"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "12px 8px" }}>
        <NavItem icon={<FeatherMessageSquare style={{ width: 15, height: 15 }} />} label="Chat" selected href="/" />
        <NavItem icon={<FeatherDatabase style={{ width: 15, height: 15 }} />} label="Knowledge Base" href="/knowledge-base" />
        <NavItem icon={<FeatherSettings style={{ width: 15, height: 15 }} />} label="Settings" href="/settings" />
        <NavItem icon={<FeatherLayoutDashboard style={{ width: 15, height: 15 }} />} label="Admin" href="/admin" />
      </div>

      {/* Upload section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px", borderTop: "1px solid #1f2228" }}>
        <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: "#fff", textTransform: "uppercase" }}>
          Upload Files
        </span>

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

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isIngesting}
          onDragOver={(e) => { e.preventDefault(); if (!isUploading && !isIngesting) e.currentTarget.style.borderColor = "#2563eb"; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = "#1f2228"; }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "#1f2228";
            if (!isUploading && !isIngesting && e.dataTransfer.files.length > 0) {
              onUploadFiles(e.dataTransfer.files);
            }
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "20px 16px",
            background: "transparent",
            border: "1px dashed #1f2228",
            borderRadius: 8,
            cursor: isUploading || isIngesting ? "not-allowed" : "pointer",
            opacity: isUploading || isIngesting ? 0.6 : 1,
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { if (!isUploading && !isIngesting) e.currentTarget.style.borderColor = "#474747"; }}
          onMouseLeave={(e) => { if (!isUploading && !isIngesting) e.currentTarget.style.borderColor = "#1f2228"; }}
        >
          {isUploading || isIngesting ? (
            <>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #1f2228", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
              <span style={{ fontSize: 12, fontFamily: FONT, color: "#7d8187", letterSpacing: "-0.025em" }}>
                {isIngesting ? "Processing…" : "Uploading…"}
              </span>
            </>
          ) : (
            <>
              <FeatherUploadCloud style={{ width: 18, height: 18, color: "#fff" }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 12, fontFamily: FONT, color: "#ffffff", letterSpacing: "-0.025em", textAlign: "center" }}>
                  Drop files or click to browse
                </span>
                <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#a0a4ab", textAlign: "center" }}>
                  PDF · DOCX · TXT · MD · CSV
                </span>
              </div>
            </>
          )}
        </button>

        {error && (
          <p style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#f05070", margin: 0 }}>{error}</p>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={{ flex: 1, overflow: "hidden", borderTop: "1px solid #1f2228" }}>
          <SidebarFileList files={files} onDelete={onDeleteFile} />
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderTop: "1px solid #1f2228", marginTop: "auto" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f2228", border: "1px solid #474747", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FeatherUser style={{ width: 14, height: 14, color: "#7d8187" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Alex Morgan</span>
          <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#a0a4ab" }}>Admin</span>
        </div>
      </div>
    </div>
  );
}
