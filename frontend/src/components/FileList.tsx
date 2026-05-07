import type { FileInfo } from "@/lib/types";

interface FileListProps {
  files: FileInfo[];
  ingestMessage?: string | null;
  onDelete?: (fileName: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function FileStatusBadge({ status }: { status: FileInfo["status"] }) {
  switch (status) {
    case "uploading":
      return (
        <span className="flex items-center gap-1 text-[10px] font-[500] text-[#60646c]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b0b4ba] animate-pulse" />
          Uploading
        </span>
      );
    case "ingesting":
      return (
        <span className="flex items-center gap-1 text-[10px] font-[500] text-[#ab6400]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ab6400] animate-pulse" />
          Processing
        </span>
      );
    case "ingested":
      return (
        <span className="flex items-center gap-1 text-[10px] font-[500] text-[#1c7a4a]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1c7a4a]" />
          Ready
        </span>
      );
    case "uploaded":
      return (
        <span className="flex items-center gap-1 text-[10px] font-[500] text-[#60646c]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d9d9e0]" />
          Uploaded
        </span>
      );
    case "error":
      return (
        <span className="flex items-center gap-1 text-[10px] font-[500] text-[#c0392b]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c0392b]" />
          Error
        </span>
      );
    default:
      return null;
  }
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const colorMap: Record<string, string> = {
    pdf: "#c0392b", docx: "#2b6bcd", doc: "#2b6bcd",
    txt: "#60646c", md: "#8145b5", csv: "#1c7a4a",
  };
  const color = colorMap[ext] ?? "#60646c";
  return (
    <div
      className="shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center text-[9px] font-[700] uppercase leading-none"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {ext.slice(0, 3)}
    </div>
  );
}

export function FileList({ files, ingestMessage, onDelete }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="px-4 py-3">
        <p className="text-[12px] text-[#b0b4ba] text-center">No documents yet</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      {ingestMessage && (
        <p className="text-[11px] text-[#60646c] mb-2 px-1 animate-fade-in">{ingestMessage}</p>
      )}
      <div className="flex flex-col gap-1">
        {files.map((file) => (
          <div
            key={file.name}
            className="group flex items-center gap-2.5 px-3 py-2 rounded-[8px] bg-[#fafafa] border border-[#f0f0f3] hover:border-[#e0e1e6] transition-colors"
            title={file.errorMessage ?? file.name}
          >
            <FileIcon name={file.name} />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-[500] text-[#1c2024] truncate leading-tight">{file.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <FileStatusBadge status={file.status} />
                {file.size > 0 && (
                  <span className="text-[10px] text-[#b0b4ba]">{formatSize(file.size)}</span>
                )}
              </div>
            </div>
            {onDelete && (
              <button
                onClick={() => onDelete(file.name)}
                className="shrink-0 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full flex items-center justify-center text-[#b0b4ba] hover:text-[#c0392b] hover:bg-[#fff0f0] transition-all"
                aria-label={`Delete ${file.name}`}
                title="Delete"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
