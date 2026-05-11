"use client";

import { Button } from "@/ui/components/Button";
import { Table } from "@/ui/components/Table";
import { FeatherDatabase, FeatherPlus } from "@subframe/core";
import type { FileInfo } from "@/lib/types";
import { FileRow } from "./FileRow";

interface FileTableProps {
  files: FileInfo[];
  filtered: FileInfo[];
  pageFiles: FileInfo[];
  onDelete: (name: string) => void;
  onClearFilters: () => void;
  onAddFile: () => void;
}

export function FileTable({
  files,
  filtered,
  pageFiles,
  onDelete,
  onClearFilters,
  onAddFile,
}: FileTableProps) {
  if (files.length === 0) {
    return (
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
          onClick={onAddFile}
        >
          Add your first file
        </Button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="text-body font-body text-subtext-color">No files match your search</span>
        <Button variant="neutral-secondary" size="small" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
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
        <FileRow key={file.name} file={file} onDelete={onDelete} />
      ))}
    </Table>
  );
}
