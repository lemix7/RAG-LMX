import React from "react";
import { Badge } from "@/ui/components/Badge";
import { Table } from "@/ui/components/Table";
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

interface FileRowProps {
  file: FileInfo;
  onDelete?: (name: string) => void;
}

export function FileRow({ file, onDelete }: FileRowProps) {
  const ext = getExt(file.name);

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

  const typeBadgeVariant: React.ComponentProps<typeof Badge>["variant"] =
    ext === "PDF" ? "error" :
    ext === "DOCX" || ext === "DOC" ? "brand" :
    ext === "CSV" ? "success" :
    ext === "TXT" ? "warning" :
    "neutral";

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
