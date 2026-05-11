"use client";

import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { FeatherDatabase, FeatherLayers, FeatherLoader, FeatherPlus } from "@subframe/core";

interface KnowledgeBaseHeaderProps {
  fileCount: number;
  isUploading: boolean;
  isIngesting: boolean;
  error?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadFiles: (files: FileList) => void;
}

export function KnowledgeBaseHeader({
  fileCount,
  isUploading,
  isIngesting,
  error,
  fileInputRef,
  onUploadFiles,
}: KnowledgeBaseHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border px-8 py-4 mobile:px-4">
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 mr-2 mobile:flex">
          <div className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-brand-primary">
            <FeatherLayers className="text-heading-3 font-heading-3 text-neutral-0" />
          </div>
        </div>
        <FeatherDatabase className="text-heading-3 font-heading-3 text-brand-700 mobile:hidden" />
        <span className="text-heading-2 font-heading-2 text-default-font">Knowledge Base</span>
        <Badge variant="neutral">{fileCount} Files</Badge>
      </div>

      <div className="flex items-center gap-2">
        {error && (
          <span className="text-caption font-caption text-error-600 max-w-[200px] truncate">
            {error}
          </span>
        )}
        <Button
          variant="brand-secondary"
          size="medium"
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
            if (e.target.files) onUploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
