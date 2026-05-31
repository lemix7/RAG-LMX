"use client";

import { useState, useRef, useCallback } from "react";
import { useFiles } from "@/lib/useFiles";
import { AppSidebar } from "@/components/AppSidebar";
import { KnowledgeBaseHeader } from "./components/KnowledgeBaseHeader";
import { StatCards } from "./components/StatCards";
import { FileToolbar } from "./components/FileToolbar";
import { FileTable } from "./components/FileTable";
import { Pagination } from "./components/Pagination";
import { getFilterType, ITEMS_PER_PAGE } from "./components/utils";
import type { FilterType } from "./components/utils";

export default function KnowledgeBasePage() {
  const { files, isUploading, isIngesting, error, uploadFiles, deleteFile } = useFiles();

  const [filter, setFilter] = useState<FilterType>("All Types");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const handleSearchChange = (value: string) => { setSearch(value); setPage(1); };
  const handleFilterChange = (value: FilterType) => { setFilter(value); setPage(1); };
  const handleClearFilters = () => { setSearch(""); setFilter("All Types"); };

  const filtered = files.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All Types" || getFilterType(f.name) === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageFiles = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const ready      = files.filter((f) => f.status === "ingested").length;
  const processing = files.filter((f) => f.status === "ingesting" || f.status === "uploading").length;
  const errored    = files.filter((f) => f.status === "error").length;

  return (
    <div
      style={{ display: "flex", height: "100%", width: "100%", alignItems: "flex-start", background: "#0c0c0b", overflow: "hidden", transition: "outline 0.15s" }}
      className={isDragOver ? "kb-drop-active" : ""}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false); }}
      onDrop={handleDrop}
    >
      {/* Sidebar — hidden on mobile, always visible md+ */}
      <div className="hidden md:flex" style={{ alignSelf: "stretch" }}>
        <AppSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden"
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="md:hidden"
            style={{ position: "fixed", inset: 0, right: "auto", zIndex: 50, display: "flex", animation: "slideInLeft 0.2s ease-out" }}
          >
            <AppSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "flex-start", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
        <div className="kb-animate-header" style={{ width: "100%", flexShrink: 0 }}>
        <KnowledgeBaseHeader
          fileCount={files.length}
          isUploading={isUploading}
          isIngesting={isIngesting}
          error={error}
          fileInputRef={fileInputRef}
          onUploadFiles={uploadFiles}
          onMenuClick={() => setSidebarOpen(true)}
        />
        </div>

        {/* Body */}
        <div className="kb-body" style={{ display: "flex", width: "100%", flexDirection: "column", gap: 48, padding: "40px 40px 48px" }}>
          <StatCards total={files.length} ready={ready} processing={processing} errored={errored} />

          {/* Files card — same style as admin users table */}
          <div className="kb-animate-table" style={{ display: "flex", flexDirection: "column", border: "1px solid #1f2228", background: "#0c0c0b" }}>
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid #1f2228" }}>
              <span style={{ fontSize: 12, fontFamily: "var(--font-space-mono), ui-monospace, monospace", letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>
                Files
              </span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-space-mono), ui-monospace, monospace", letterSpacing: "0.1em", color: "#474747" }}>
                {filtered.length} of {files.length}
              </span>
            </div>

            {/* Toolbar */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #1f2228" }}>
              <FileToolbar
                search={search}
                filter={filter}
                onSearchChange={handleSearchChange}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* Table */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <FileTable
                files={files}
                filtered={filtered}
                pageFiles={pageFiles}
                onDelete={deleteFile}
                onClearFilters={handleClearFilters}
                onAddFile={() => fileInputRef.current?.click()}
              />
            </div>

            {/* Pagination */}
            {filtered.length > 0 && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid #1f2228" }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filtered.length}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
