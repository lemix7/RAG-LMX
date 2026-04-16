"use client";

import { useCallback, useRef, useState, DragEvent } from "react";

interface FileDropZoneProps {
  onFiles: (files: FileList | File[]) => void;
  isUploading: boolean;
  isIngesting: boolean;
}

const ACCEPTED = ".txt,.pdf,.docx,.doc,.md,.csv";
const ACCEPTED_TYPES = new Set(["txt", "pdf", "docx", "doc", "md", "csv"]);

function isValidFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_TYPES.has(ext);
}

export function FileDropZone({ onFiles, isUploading, isIngesting }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [rejectMessage, setRejectMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      setRejectMessage(null);
      const valid = files.filter(isValidFile);
      const invalid = files.filter((f) => !isValidFile(f));
      if (invalid.length > 0) {
        setRejectMessage(`Unsupported: ${invalid.map((f) => f.name).join(", ")}`);
        setTimeout(() => setRejectMessage(null), 4000);
      }
      if (valid.length > 0) onFiles(valid);
    },
    [onFiles]
  );

  const handleDragOver = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const handleInputChange = useCallback(() => {
    const files = inputRef.current?.files;
    if (files && files.length > 0) {
      handleFiles(Array.from(files));
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [handleFiles]);

  const isBusy = isUploading || isIngesting;

  return (
    <div className="px-4 pt-4 pb-2">
      <input ref={inputRef} type="file" multiple accept={ACCEPTED} className="hidden" onChange={handleInputChange} disabled={isBusy} />
      <button
        onClick={() => !isBusy && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isBusy}
        className={`w-full rounded-[12px] border-2 border-dashed transition-all duration-150 flex flex-col items-center justify-center gap-2 py-6 px-4 text-center cursor-pointer select-none
          ${isDragging
            ? "border-[#000000] bg-[#f8f8fa] scale-[0.99]"
            : isBusy
            ? "border-[#e0e1e6] bg-[#fafafa] cursor-not-allowed"
            : "border-[#d9d9e0] bg-[#fafafa] hover:border-[#b0b4ba] hover:bg-white"
          }`}
        type="button"
        aria-label="Upload documents"
      >
        {isBusy ? (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-[#e0e1e6] border-t-[#000000] animate-spin-slow" />
            <p className="text-[13px] font-[500] text-[#60646c]">
              {isIngesting ? "Processing…" : "Uploading…"}
            </p>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-[10px] bg-white border border-[#e0e1e6] shadow-[0px_2px_4px_rgba(0,0,0,0.06)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 11V3M8 3L5 6M8 3L11 6" stroke="#60646c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12v1.5A.5.5 0 0 0 2.5 14h11a.5.5 0 0 0 .5-.5V12" stroke="#60646c" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-[600] text-[#1c2024] leading-tight">
                {isDragging ? "Drop files here" : "Drop files or click to browse"}
              </p>
              <p className="text-[11px] text-[#b0b4ba] mt-0.5">PDF, DOCX, TXT, MD, CSV</p>
            </div>
          </>
        )}
      </button>
      {rejectMessage && (
        <p className="mt-1.5 text-[11px] text-[#ab6400] px-1 animate-fade-in">{rejectMessage}</p>
      )}
    </div>
  );
}
