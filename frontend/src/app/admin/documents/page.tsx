"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Badge } from "@/ui/components/Badge";
import { Table } from "@/ui/components/Table";
import {
  FeatherAlertCircle,
  FeatherArrowUpRight,
  FeatherCheckCircle,
  FeatherDatabase,
  FeatherFileText,
  FeatherLoader,
  FeatherSearch,
  FeatherTrash2,
} from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface DocData {
  name: string;
  type: "PDF" | "DOCX" | "TXT" | "CSV" | "MD";
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "ingested" | "ingesting" | "error";
  chunks: number;
}

const DOCS: DocData[] = [
  { name: "Q4-2024-Report.pdf",          type: "PDF",  size: "2.4 MB", uploadedBy: "Alex Thompson",   uploadedAt: "Nov 12, 2024", status: "ingested",  chunks: 142 },
  { name: "Product-Roadmap-2025.docx",   type: "DOCX", size: "1.1 MB", uploadedBy: "Sarah Mitchell",  uploadedAt: "Nov 10, 2024", status: "ingested",  chunks: 88  },
  { name: "User-Research-Notes.txt",     type: "TXT",  size: "340 KB", uploadedBy: "James Rodriguez", uploadedAt: "Nov 8, 2024",  status: "ingested",  chunks: 24  },
  { name: "Sales-Data-Oct.csv",          type: "CSV",  size: "890 KB", uploadedBy: "Emily Chen",      uploadedAt: "Nov 6, 2024",  status: "ingested",  chunks: 61  },
  { name: "Engineering-Spec-v3.pdf",     type: "PDF",  size: "4.7 MB", uploadedBy: "Michael Park",    uploadedAt: "Nov 5, 2024",  status: "ingesting", chunks: 0   },
  { name: "Onboarding-Guide.md",         type: "MD",   size: "120 KB", uploadedBy: "Alex Thompson",   uploadedAt: "Nov 3, 2024",  status: "ingested",  chunks: 18  },
  { name: "Legal-Terms-2024.pdf",        type: "PDF",  size: "3.2 MB", uploadedBy: "Priya Sharma",    uploadedAt: "Oct 30, 2024", status: "error",     chunks: 0   },
  { name: "Customer-Feedback-Q3.docx",   type: "DOCX", size: "780 KB", uploadedBy: "Lucas Fernandez", uploadedAt: "Oct 28, 2024", status: "ingested",  chunks: 54  },
  { name: "Architecture-Overview.pdf",   type: "PDF",  size: "1.9 MB", uploadedBy: "Nina Patel",      uploadedAt: "Oct 25, 2024", status: "ingested",  chunks: 110 },
  { name: "Support-Tickets-Oct.csv",     type: "CSV",  size: "560 KB", uploadedBy: "Sarah Mitchell",  uploadedAt: "Oct 22, 2024", status: "ingested",  chunks: 43  },
];

const TYPE_COLORS: Record<string, string> = {
  PDF: "#f05070", DOCX: "#2563eb", TXT: "#c47800", CSV: "#3a9a4a", MD: "#474747",
};

const TYPES = ["All Types", "PDF", "DOCX", "TXT", "CSV", "MD"] as const;
const STATUSES = ["All Statuses", "Ready", "Processing", "Error"] as const;

function TypePill({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? "#474747";
  return (
    <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: "0.1em", color, border: `1px solid ${color}`, borderRadius: 9999, padding: "2px 8px", opacity: 0.85 }}>
      {type}
    </span>
  );
}

function StatusCell({ status }: { status: DocData["status"] }) {
  const map = {
    ingested:  { label: "Ready",      variant: "success" as const, icon: <FeatherCheckCircle style={{ width: 11, height: 11 }} /> },
    ingesting: { label: "Processing", variant: "neutral" as const, icon: <FeatherLoader      style={{ width: 11, height: 11 }} /> },
    error:     { label: "Error",      variant: "error"   as const, icon: <FeatherAlertCircle style={{ width: 11, height: 11 }} /> },
  };
  const s = map[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof TYPES)[number]>("All Types");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUSES)[number]>("All Statuses");
  const [focused, setFocused] = useState(false);

  const filtered = DOCS.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.uploadedBy.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "All Types" || d.type === typeFilter;
    const matchStatus = statusFilter === "All Statuses" || (statusFilter === "Ready" && d.status === "ingested") || (statusFilter === "Processing" && d.status === "ingesting") || (statusFilter === "Error" && d.status === "error");
    return matchSearch && matchType && matchStatus;
  });

  const totalChunks = DOCS.reduce((acc, d) => acc + d.chunks, 0);
  const totalSize   = "16.1 MB";

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "40px 40px 48px" }} className="admin-body">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff", lineHeight: 1.2 }}>Documents</span>
          <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187", lineHeight: 1.5 }}>All documents ingested into the knowledge base</span>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "#1f2228" }}>
          {[
            { label: "Total Docs",   value: String(DOCS.length),                                        icon: <FeatherFileText    style={{ width: 15, height: 15 }} />, color: "#2563eb", delta: 8.2  },
            { label: "Ready",        value: String(DOCS.filter((d) => d.status === "ingested").length),  icon: <FeatherCheckCircle style={{ width: 15, height: 15 }} />, color: "#3a9a4a", delta: 11.4 },
            { label: "Total Chunks", value: String(totalChunks),                                        icon: <FeatherDatabase    style={{ width: 15, height: 15 }} />, color: "#c47800", delta: 9.7  },
            { label: "Total Size",   value: totalSize,                                                  icon: <FeatherDatabase    style={{ width: 15, height: 15 }} />, color: "#474747", delta: 18.3 },
          ].map(({ label, value, icon, color, delta }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flex: 1, minWidth: 120, flexDirection: "column", gap: 10, padding: 16, background: "#0c0c0b" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>{label}</span>
                <span style={{ color, display: "flex", opacity: 0.8 }}>{icon}</span>
              </div>
              <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#ffffff" }}>{value}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: "#3a9a4a" }}>
                <FeatherArrowUpRight style={{ width: 11, height: 11 }} />
                {delta}% vs last month
              </span>
            </motion.div>
          ))}
        </div>

        {/* Documents table card */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #1f2228", background: "#0c0c0b" }}>
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid #1f2228" }}>
            <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>All Documents</span>
            <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#474747" }}>{filtered.length} of {DOCS.length}</span>
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1f2228" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: 240 }}>
              <span style={{ position: "absolute", left: 12, color: "#474747", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                <FeatherSearch style={{ width: 13, height: 13 }} />
              </span>
              <input
                type="text"
                placeholder="Search documents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ width: "100%", background: "#0c0c0b", color: "#ffffff", border: `1px solid ${focused ? "#2563eb" : "#1f2228"}`, borderRadius: 9999, padding: "8px 14px 8px 32px", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                onMouseEnter={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#474747"; }}
                onMouseLeave={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#1f2228"; }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TYPES.map((t) => {
                const active = typeFilter === t;
                return (
                  <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: "4px 12px", borderRadius: 9999, border: `1px solid ${active ? "#2563eb" : "#1f2228"}`, background: active ? "#1a3568" : "transparent", color: active ? "#ffffff" : "#7d8187", fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.color = "#ffffff"; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#7d8187"; } }}
                  >{t}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {STATUSES.map((s) => {
                const active = statusFilter === s;
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: "4px 12px", borderRadius: 9999, border: `1px solid ${active ? "#2563eb" : "#1f2228"}`, background: active ? "#1a3568" : "transparent", color: active ? "#ffffff" : "#7d8187", fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.color = "#ffffff"; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#7d8187"; } }}
                  >{s}</button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table header={
              <Table.HeaderRow>
                <Table.HeaderCell>File Name</Table.HeaderCell>
                <Table.HeaderCell>Type</Table.HeaderCell>
                <Table.HeaderCell>Size</Table.HeaderCell>
                <Table.HeaderCell>Uploaded By</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Chunks</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.HeaderRow>
            }>
              {filtered.map((doc) => (
                <Table.Row key={doc.name}>
                  <Table.Cell>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FeatherFileText style={{ width: 14, height: 14, color: TYPE_COLORS[doc.type] ?? "#474747", flexShrink: 0 }} />
                      <span style={{ whiteSpace: "nowrap", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell><TypePill type={doc.type} /></Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 13, fontFamily: MONO, letterSpacing: "0.05em", color: "#474747" }}>{doc.size}</span></Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>{doc.uploadedBy}</span></Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 13, fontFamily: MONO, letterSpacing: "0.05em", color: "#474747" }}>{doc.uploadedAt}</span></Table.Cell>
                  <Table.Cell><StatusCell status={doc.status} /></Table.Cell>
                  <Table.Cell><span style={{ fontSize: 13, fontFamily: MONO, letterSpacing: "0.1em", color: doc.chunks > 0 ? "#7d8187" : "#474747" }}>{doc.chunks > 0 ? doc.chunks : "—"}</span></Table.Cell>
                  <Table.Cell>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        style={{ background: "none", border: "none", color: "#474747", cursor: "pointer", padding: 4, display: "inline-flex", alignItems: "center", borderRadius: 4, transition: "color 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#f05070")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#474747")}
                        aria-label={`Delete ${doc.name}`}
                      >
                        <FeatherTrash2 style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}
