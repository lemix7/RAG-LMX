import type { FileInfo } from "@/lib/types";
import { FeatherTrash2, FeatherFileText, FeatherFile, FeatherFileCode } from "@subframe/core";

function formatSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getStatusDot(status: FileInfo["status"]) {
  switch (status) {
    case "ingested":
      return <span className="w-1.5 h-1.5 rounded-full bg-success-500 shrink-0" />;
    case "ingesting":
    case "uploading":
      return <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse shrink-0" />;
    case "error":
      return <span className="w-1.5 h-1.5 rounded-full bg-error-500 shrink-0" />;
    default:
      return <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />;
  }
}

function FileIcon({ name }: { name: string }) {
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  if (ext === "md") return <FeatherFileCode className="text-body font-body text-brand-primary" />;
  if (ext === "csv") return <FeatherFile className="text-body font-body text-brand-primary" />;
  return <FeatherFileText className="text-body font-body text-brand-primary" />;
}

interface SidebarFileListProps {
  files: FileInfo[];
  onDelete?: (name: string) => void;
}

export function SidebarFileList({ files, onDelete }: SidebarFileListProps) {
  return (
    <div className="flex w-full flex-col items-start gap-1" style={{ padding: "12px 12px" }}>
      <span className="text-caption-bold font-caption-bold text-subtext-color mb-1" style={{ fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif", fontSize: 11, letterSpacing: "0.08em", color: "#fff",  }}>
        Knowledge Source ({files.length}) 
      </span>
      {files.map((file) => (
        <div
          key={file.name}
          className="group/file flex w-full items-center gap-3 rounded-md border border-solid transition-colors"
          style={{ background: "#1f2228", border: "1px solid #2a2d34", padding: "10px 12px", borderRadius: 8 }}
          title={file.errorMessage ?? file.name}
        >
          <FileIcon name={file.name} />
          <div className="flex grow shrink-0 basis-0 flex-col items-start overflow-hidden">
            <span className="whitespace-nowrap text-caption-bold font-caption-bold text-default-font truncate w-full">
              {file.name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {getStatusDot(file.status)}
              {file.size > 0 && (
                <span className=" text-[10px] font-[400] leading-[15px] text-subtext-color">
                  {formatSize(file.size)}
                </span>
              )}
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(file.name)}
              className="opacity-0 group-hover/file:opacity-100 flex h-6 w-6 flex-none items-center justify-center rounded-md text-subtext-color transition-all hover:bg-error-50 hover:text-error-600 cursor-pointer"
              aria-label={`Delete ${file.name}`}
            >
              <FeatherTrash2 className="text-[14px]" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
