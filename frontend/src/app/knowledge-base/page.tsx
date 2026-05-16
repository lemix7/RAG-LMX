"use client";

import { useState, useRef, useCallback } from "react";
import { useFiles } from "@/lib/useFiles";
import { KnowledgeBaseSidebar } from "./components/KnowledgeBaseSidebar";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      uploadFiles(e.dataTransfer.files);
    },
    [uploadFiles]
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setFilter("All Types");
  };

  const filtered = files.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All Types" || getFilterType(f.name) === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageFiles = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const ready = files.filter((f) => f.status === "ingested").length;
  const processing = files.filter((f) => f.status === "ingesting" || f.status === "uploading").length;
  const errored = files.filter((f) => f.status === "error").length;

  return (
    <div
      className="flex h-full w-full items-start bg-default-background"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <KnowledgeBaseSidebar />

      <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-auto">
        <KnowledgeBaseHeader
          fileCount={files.length}
          isUploading={isUploading}
          isIngesting={isIngesting}
          error={error}
          fileInputRef={fileInputRef}
          onUploadFiles={uploadFiles}
        />

        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-6 py-6 mobile:px-4">
          <StatCards
            total={files.length}
            ready={ready}
            processing={processing}
            errored={errored}
          />

          <FileToolbar
            search={search}
            filter={filter}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
          />

          <div style={{ width: "100%", overflow: "hidden", overflowX: "auto", border: "1px solid #1f2228", background: "#0c0c0b" }}>
            <FileTable
              files={files}
              filtered={filtered}
              pageFiles={pageFiles}
              onDelete={deleteFile}
              onClearFilters={handleClearFilters}
              onAddFile={() => fileInputRef.current?.click()}
            />
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
