import type { FileInfo } from "@/lib/types";
import { FileDropZone } from "./FileDropZone";
import { FileList } from "./FileList";

interface SidebarProps {
  files: FileInfo[];
  isUploading: boolean;
  isIngesting: boolean;
  ingestMessage?: string | null;
  error?: string | null;
  onFiles: (files: FileList | File[]) => void;
  onNewChat?: () => void;
  onClose?: () => void;
  isMobileOverlay?: boolean;
}

export function Sidebar({
  files,
  isUploading,
  isIngesting,
  ingestMessage,
  error,
  onFiles,
  onNewChat,
  onClose,
  isMobileOverlay = false,
}: SidebarProps) {
  return (
    <aside
      className={`flex flex-col bg-white border-[#e0e1e6] overflow-y-auto ${
        isMobileOverlay
          ? "w-full max-w-[320px] h-full border-r"
          : "hidden md:flex w-[300px] lg:w-[320px] border-r shrink-0"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#f0f0f3]">
        <div>
          <h1 className="text-[15px] font-[700] text-[#000000] tracking-[-0.3px]">RAG-LMX</h1>
          <p className="text-[11px] text-[#b0b4ba] mt-0.5">Chat with your documents</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#b0b4ba] hover:text-[#60646c] hover:bg-[#f0f0f3] transition-colors"
            aria-label="Close sidebar"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* New Chat button */}
      {onNewChat && (
        <div className="px-4 pt-3 pb-1">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[9999px] bg-[#000000] text-white text-[13px] font-[600] hover:bg-[#1c2024] active:scale-[0.98] transition-all duration-150"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
            New Chat
          </button>
        </div>
      )}

      {/* Section label */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-[11px] font-[600] text-[#b0b4ba] uppercase tracking-[0.06em]">
          Documents
        </p>
      </div>

      {/* Drop zone */}
      <FileDropZone onFiles={onFiles} isUploading={isUploading} isIngesting={isIngesting} />

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-[8px] bg-[#fff5f5] border border-[#fecaca] animate-fade-in">
          <p className="text-[11px] text-[#c0392b] leading-[1.4]">{error}</p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="pt-2 border-t border-[#f0f0f3] mt-2">
          <FileList files={files} ingestMessage={ingestMessage} />
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto px-4 py-4 border-t border-[#f0f0f3]">
        <p className="text-[11px] text-[#b0b4ba] leading-[1.4]">
          Supported: PDF, DOCX, TXT, MD, CSV
        </p>
      </div>
    </aside>
  );
}
