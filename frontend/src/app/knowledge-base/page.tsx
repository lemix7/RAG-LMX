"use client";

import React, { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { SidebarWithSections } from "@/ui/components/SidebarWithSections";
import { Table } from "@/ui/components/Table";
import { TextField } from "@/ui/components/TextField";
import { FeatherAlertCircle } from "@subframe/core";
import { FeatherArrowUpDown } from "@subframe/core";
import { FeatherDownloadCloud } from "@subframe/core";
import { FeatherLayers } from "@subframe/core";
import { FeatherCheckCircle } from "@subframe/core";
import { FeatherChevronLeft } from "@subframe/core";
import { FeatherChevronRight } from "@subframe/core";
import { FeatherDatabase } from "@subframe/core";
import { FeatherFile } from "@subframe/core";
import { FeatherFileCode } from "@subframe/core";
import { FeatherFileSpreadsheet } from "@subframe/core";
import { FeatherFileText } from "@subframe/core";
import { FeatherFilter } from "@subframe/core";
import { FeatherLayoutDashboard } from "@subframe/core";
import { FeatherLoader } from "@subframe/core";
import { FeatherMessageSquare } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherRefreshCw } from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherSlidersHorizontal } from "@subframe/core";
import { FeatherTrash2 } from "@subframe/core";
import { FeatherUploadCloud } from "@subframe/core";
import { useFiles } from "@/lib/useFiles";
import type { FileInfo } from "@/lib/types";

// ─── Types & Helpers ─────────────────────────────────────────────────────────

type FilterType = "All Types" | "PDF" | "DOCX" | "TXT" | "CSV" | "MD";

const ITEMS_PER_PAGE = 9;

function formatSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getExt(name: string): string {
  return (name.split(".").pop() ?? "").toUpperCase();
}

function getFilterType(name: string): FilterType {
  const ext = getExt(name);
  if (ext === "PDF") return "PDF";
  if (ext === "DOCX" || ext === "DOC") return "DOCX";
  if (ext === "TXT") return "TXT";
  if (ext === "CSV") return "CSV";
  if (ext === "MD") return "MD";
  return "All Types";
}

function simulateChunks(file: FileInfo): string {
  if (file.status !== "ingested") return "—";
  const seed = file.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return String(Math.max(10, Math.floor(file.size / 1024 / 5 + (seed % 200))));
}

function simulateDate(file: FileInfo): string {
  const seed = file.name.length * 7 + (file.size % 30);
  const month = ["Jan", "Feb", "Mar", "Apr", "May"][seed % 5];
  const day = (seed % 28) + 1;
  return `${month} ${day}, 2025`;
}

// ─── File Row ─────────────────────────────────────────────────────────────────

function FileRow({ file, onDelete }: { file: FileInfo; onDelete?: (name: string) => void }) {
  const ext = getExt(file.name);

  // File icon color by type
  const iconBg =
    ext === "PDF" ? "bg-error-100" :
    ext === "DOCX" || ext === "DOC" ? "bg-brand-100" :
    ext === "CSV" ? "bg-success-100" :
    ext === "TXT" ? "bg-warning-100" :
    "bg-neutral-100";

  const iconColor =
    ext === "PDF" ? "text-error-700" :
    ext === "DOCX" || ext === "DOC" ? "text-brand-700" :
    ext === "CSV" ? "text-success-700" :
    ext === "TXT" ? "text-warning-700" :
    "text-neutral-500";

  const FileIcon = ext === "CSV" ? FeatherFileSpreadsheet :
    ext === "MD" ? FeatherFileCode : FeatherFileText;

  // Type badge variant
  const typeBadgeVariant: React.ComponentProps<typeof Badge>["variant"] =
    ext === "PDF" ? "error" :
    ext === "DOCX" || ext === "DOC" ? "brand" :
    ext === "CSV" ? "success" :
    ext === "TXT" ? "warning" :
    "neutral";

  // Status badge
  const statusBadge = () => {
    switch (file.status) {
      case "ingested":
        return <Badge variant="success" icon={<FeatherCheckCircle />}>Ready</Badge>;
      case "ingesting":
      case "uploading":
        return <Badge variant="brand" icon={<FeatherLoader />}>Processing</Badge>;
      case "error":
        return <Badge variant="error" icon={<FeatherAlertCircle />}>Error</Badge>;
      default:
        return <Badge variant="neutral">Uploaded</Badge>;
    }
  };

  const isError = file.status === "error";

  return (
    <Table.Row clickable>
      <Table.Cell>
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 flex-none items-center justify-center rounded-[4px] ${iconBg}`}>
            <FileIcon className={`text-caption-bold font-caption-bold ${iconColor}`} />
          </div>
          <span className="whitespace-nowrap text-body-bold font-body-bold text-default-font">
            {file.name}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell>
        <Badge variant={typeBadgeVariant}>{ext}</Badge>
      </Table.Cell>
      <Table.Cell>
        <span className="whitespace-nowrap text-body font-body text-subtext-color">
          {formatSize(file.size)}
        </span>
      </Table.Cell>
      <Table.Cell>
        <span className="whitespace-nowrap text-body font-body text-subtext-color">
          {simulateDate(file)}
        </span>
      </Table.Cell>
      <Table.Cell>{statusBadge()}</Table.Cell>
      <Table.Cell>
        <span className="whitespace-nowrap text-body font-body text-subtext-color">
          {simulateChunks(file)}
        </span>
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center justify-end gap-1">
          {isError ? (
            <IconButton size="small" icon={<FeatherRefreshCw />} onClick={() => {}} />
          ) : (
            <IconButton size="small" icon={<FeatherDownloadCloud />} onClick={() => {}} />
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(file.name)}
              className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-subtext-color transition-all hover:bg-error-50 hover:text-error-600 cursor-pointer"
              aria-label={`Delete ${file.name}`}
            >
              <FeatherTrash2 className="text-[14px]" />
            </button>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const filterTypes: FilterType[] = ["All Types", "PDF", "DOCX", "TXT", "CSV", "MD"];

  return (
    <div
      className="flex h-full w-full items-start bg-default-background"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* ── Sidebar ── */}
      <SidebarWithSections
        className="h-auto w-72 flex-none self-stretch mobile:hidden"
        header={
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand-primary">
              <FeatherLayers className="text-heading-3 font-heading-3 text-neutral-0" />
            </div>
            <span className="text-heading-3 font-heading-3 text-default-font">RAG LMX</span>
          </div>
        }
        footer={
          <>
            <div className="flex grow shrink-0 basis-0 items-center gap-2">
              <Avatar>A</Avatar>
              <div className="flex flex-col items-start">
                <span className="text-caption-bold font-caption-bold text-default-font">Alex Morgan</span>
                <span className="text-caption font-caption text-subtext-color">Admin</span>
              </div>
            </div>
            <IconButton size="small" icon={<FeatherMoreHorizontal />} onClick={() => {}} />
          </>
        }
      >
        <Link href="/" className="contents">
          <SidebarWithSections.NavItem icon={<FeatherMessageSquare />} selected={false}>
            Chat
          </SidebarWithSections.NavItem>
        </Link>
        <SidebarWithSections.NavItem icon={<FeatherDatabase />} selected>
          Knowledge Base
        </SidebarWithSections.NavItem>
        <SidebarWithSections.NavItem icon={<FeatherSettings />} selected={false}>
          Settings
        </SidebarWithSections.NavItem>
        <SidebarWithSections.NavItem icon={<FeatherLayoutDashboard />} selected={false}>
          Admin
        </SidebarWithSections.NavItem>
      </SidebarWithSections>

      {/* ── Main ── */}
      <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-auto">
        {/* Header */}
        <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-8 py-4 mobile:px-4">
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 mr-2 mobile:flex">
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand-primary">
                <FeatherLayers className="text-heading-3 font-heading-3 text-neutral-0" />
              </div>
            </div>
            <FeatherDatabase className="text-heading-3 font-heading-3 text-brand-700 mobile:hidden" />
            <span className="text-heading-2 font-heading-2 text-default-font">Knowledge Base</span>
            <Badge variant="neutral">{files.length} Files</Badge>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-caption font-caption text-error-600 max-w-[200px] truncate">
                {error}
              </span>
            )}
            <Button
              className="mobile:hidden"
              variant="neutral-secondary"
              size="small"
              icon={<FeatherUploadCloud />}
              disabled={isUploading || isIngesting}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </Button>
            <Button
              variant="brand-primary"
              size="small"
              icon={isUploading || isIngesting ? <FeatherLoader /> : <FeatherPlus />}
              disabled={isUploading || isIngesting}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? "Uploading…" : isIngesting ? "Processing…" : "Add Files"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.txt,.md,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-6 px-8 py-6 mobile:px-4">

          {/* Stat Cards */}
          <div className="flex w-full flex-wrap items-start gap-4 mobile:gap-3">
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-neutral-border bg-neutral-50 px-4 py-4">
              <span className="text-caption font-caption text-subtext-color">Total Files</span>
              <div className="flex items-center gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">{files.length}</span>
                <FeatherFile className="text-body font-body text-subtext-color" />
              </div>
            </div>
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-success-200 bg-success-50 px-4 py-4">
              <span className="text-caption font-caption text-subtext-color">Ready</span>
              <div className="flex items-center gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">{ready}</span>
                <FeatherCheckCircle className="text-body font-body text-success-600" />
              </div>
            </div>
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-brand-200 bg-brand-50 px-4 py-4">
              <span className="text-caption font-caption text-subtext-color">Processing</span>
              <div className="flex items-center gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">{processing}</span>
                <FeatherLoader className="text-body font-body text-brand-700" />
              </div>
            </div>
            <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-1 rounded-lg border border-solid border-error-200 bg-error-50 px-4 py-4">
              <span className="text-caption font-caption text-subtext-color">Error</span>
              <div className="flex items-center gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font">{errored}</span>
                <FeatherAlertCircle className="text-body font-body text-error-600" />
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex w-full flex-wrap items-center gap-3 mobile:flex-col mobile:flex-nowrap mobile:items-start">
            <TextField
              className="h-auto w-72 flex-none mobile:w-full"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                placeholder="Search files..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </TextField>
            <div className="flex flex-wrap items-center gap-2">
              {filterTypes.map((t) => (
                <Badge
                  key={t}
                  variant={filter === t ? "brand" : "neutral"}
                  icon={filter === t ? <FeatherFilter /> : undefined}
                  onClick={() => { setFilter(t); setPage(1); }}
                  className="cursor-pointer"
                >
                  {t}
                </Badge>
              ))}
            </div>
            <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2 mobile:justify-start">
              <Button variant="neutral-secondary" size="small" icon={<FeatherArrowUpDown />} onClick={() => {}}>
                Sort
              </Button>
              <Button variant="neutral-secondary" size="small" icon={<FeatherSlidersHorizontal />} onClick={() => {}}>
                Filter
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="flex w-full items-start overflow-hidden rounded-lg border border-solid border-neutral-border overflow-x-auto">
            {files.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center gap-3 py-16 px-8 text-center">
                <FeatherDatabase className="text-heading-1 font-heading-1 text-neutral-300" />
                <span className="text-body-bold font-body-bold text-default-font">No files yet</span>
                <span className="text-body font-body text-subtext-color max-w-xs">
                  Upload PDF, DOCX, TXT, CSV, or MD files to build your knowledge base.
                </span>
                <Button
                  variant="brand-primary"
                  size="small"
                  icon={<FeatherPlus />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Add your first file
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex w-full flex-col items-center justify-center gap-2 py-12 text-center">
                <span className="text-body font-body text-subtext-color">No files match your search</span>
                <Button variant="neutral-secondary" size="small" onClick={() => { setSearch(""); setFilter("All Types"); }}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <Table
                header={
                  <Table.HeaderRow>
                    <Table.HeaderCell>FILE NAME</Table.HeaderCell>
                    <Table.HeaderCell>TYPE</Table.HeaderCell>
                    <Table.HeaderCell>SIZE</Table.HeaderCell>
                    <Table.HeaderCell>DATE UPLOADED</Table.HeaderCell>
                    <Table.HeaderCell>STATUS</Table.HeaderCell>
                    <Table.HeaderCell>CHUNKS</Table.HeaderCell>
                    <Table.HeaderCell />
                  </Table.HeaderRow>
                }
              >
                {pageFiles.map((file) => (
                  <FileRow key={file.name} file={file} onDelete={deleteFile} />
                ))}
              </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex w-full items-center justify-between">
              <span className="text-caption font-caption text-subtext-color">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} files
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="neutral-secondary"
                  size="small"
                  icon={<FeatherChevronLeft />}
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`flex h-7 w-7 flex-none items-center justify-center rounded-[4px] ${
                        p === currentPage
                          ? "bg-brand-600"
                          : "hover:bg-neutral-100"
                      }`}
                    >
                      <span className={`text-caption font-caption ${
                        p === currentPage ? "text-default-background font-caption-bold" : "text-subtext-color"
                      }`}>
                        {p}
                      </span>
                    </button>
                  ))}
                </div>
                <Button
                  variant="neutral-secondary"
                  size="small"
                  iconRight={<FeatherChevronRight />}
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
