"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Badge } from "@/ui/components/Badge";
import { Table } from "@/ui/components/Table";
import {
  FeatherCheckCircle,
  FeatherDatabase,
  FeatherFileText,
  FeatherSearch,
  FeatherTrash2,
} from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface DocData {
  name: string;
  type: string;
  size: number;
  ingested: boolean;
}

const TYPE_COLORS: Record<string, string> = {
  pdf: "#f05070", docx: "#2563eb", doc: "#2563eb",
  txt: "#c47800", csv: "#3a9a4a", md: "#474747",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExt(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function TypePill({ type }: { type: string }) {
  const color = TYPE_COLORS[type] ?? "#474747";
  return (
    <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: "0.1em", color, border: `1px solid ${color}`, borderRadius: 9999, padding: "2px 8px", opacity: 0.85, textTransform: "uppercase" }}>
      {type}
    </span>
  );
}

const TYPES = ["All Types", "pdf", "docx", "txt", "csv", "md"] as const;
const STATUSES = ["All Statuses", "Ready", "Not Ingested"] as const;

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses");
  const [focused, setFocused] = useState(false);

  async function loadDocs() {
    const res = await fetch("/api/files", { cache: "no-store" }).catch(() => null);
    if (!res?.ok) { setLoading(false); return; }
    const json = await res.json();
    setDocs(json.files ?? []);
    setLoading(false);
  }

  useEffect(() => { loadDocs(); }, []);

  async function handleDelete(name: string) {
    await fetch(`/api/files/${encodeURIComponent(name)}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.name !== name));
  }

  const filtered = docs.filter((d) => {
    const ext = getExt(d.name);
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All Types" || ext === typeFilter;
    const matchStatus = statusFilter === "All Statuses" ||
      (statusFilter === "Ready" && d.ingested) ||
      (statusFilter === "Not Ingested" && !d.ingested);
    return matchSearch && matchType && matchStatus;
  });

  const ingestedCount = docs.filter((d) => d.ingested).length;
  const totalSize = docs.reduce((acc, d) => acc + d.size, 0);

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "40px 40px 48px" }} className="admin-body">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff", lineHeight: 1.2 }}>Documents</span>
          <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187", lineHeight: 1.5 }}>All documents in the knowledge base</span>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "#1f2228" }}>
          {[
            { label: "Total Docs",  value: loading ? "—" : String(docs.length),      icon: <FeatherFileText    style={{ width: 15, height: 15 }} />, color: "#2563eb" },
            { label: "Ready",       value: loading ? "—" : String(ingestedCount),     icon: <FeatherCheckCircle style={{ width: 15, height: 15 }} />, color: "#3a9a4a" },
            { label: "Total Size",  value: loading ? "—" : formatBytes(totalSize),    icon: <FeatherDatabase    style={{ width: 15, height: 15 }} />, color: "#c47800" },
          ].map(({ label, value, icon, color }, i) => (
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
            </motion.div>
          ))}
        </div>

        {/* Documents table */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #1f2228", background: "#0c0c0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid #1f2228" }}>
            <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>All Documents</span>
            <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#474747" }}>{filtered.length} of {docs.length}</span>
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
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TYPES.map((t) => {
                const active = typeFilter === t;
                return (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    style={{ padding: "4px 12px", borderRadius: 9999, border: `1px solid ${active ? "#2563eb" : "#1f2228"}`, background: active ? "#1a3568" : "transparent", color: active ? "#ffffff" : "#7d8187", fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s", textTransform: "uppercase" }}
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
                  <button key={s} onClick={() => setStatusFilter(s)}
                    style={{ padding: "4px 12px", borderRadius: 9999, border: `1px solid ${active ? "#2563eb" : "#1f2228"}`, background: active ? "#1a3568" : "transparent", color: active ? "#ffffff" : "#7d8187", fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.color = "#ffffff"; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#7d8187"; } }}
                  >{s}</button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            {loading ? (
              <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, fontFamily: MONO, color: "#474747", letterSpacing: "0.08em" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, fontFamily: MONO, color: "#474747", letterSpacing: "0.08em" }}>No documents found</div>
            ) : (
              <Table header={
                <Table.HeaderRow>
                  <Table.HeaderCell>File Name</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Size</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.HeaderRow>
              }>
                {filtered.map((doc) => {
                  const ext = getExt(doc.name);
                  return (
                    <Table.Row key={doc.name}>
                      <Table.Cell>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FeatherFileText style={{ width: 14, height: 14, color: TYPE_COLORS[ext] ?? "#474747", flexShrink: 0 }} />
                          <span style={{ whiteSpace: "nowrap", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell><TypePill type={ext} /></Table.Cell>
                      <Table.Cell>
                        <span style={{ whiteSpace: "nowrap", fontSize: 13, fontFamily: MONO, letterSpacing: "0.05em", color: "#474747" }}>{formatBytes(doc.size)}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={doc.ingested ? "success" : "neutral"}>{doc.ingested ? "Ready" : "Not Ingested"}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleDelete(doc.name)}
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
                  );
                })}
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
