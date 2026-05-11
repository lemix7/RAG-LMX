"use client";

import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { IconButton } from "@/ui/components/IconButton";
import { SidebarWithSections } from "@/ui/components/SidebarWithSections";
import { SidebarFileList } from "@/components/SidebarFileList";
import {
  FeatherDatabase,
  FeatherLayoutDashboard,
  FeatherMessageSquare,
  FeatherMoreHorizontal,
  FeatherSettings,
  FeatherUploadCloud,
  FeatherZap,
} from "@subframe/core";
import type { FileInfo } from "@/lib/types";

interface ChatSidebarProps {
  files: FileInfo[];
  isUploading: boolean; 
  isIngesting: boolean;
  error?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadFiles: (files: FileList) => void;
  onDeleteFile: (name: string) => void;
}

export function ChatSidebar({
  files,
  isUploading,
  isIngesting,
  error,
  fileInputRef,
  onUploadFiles,
  onDeleteFile,
}: ChatSidebarProps) {
  return (
    <SidebarWithSections
      className="h-auto w-72 flex-none self-stretch"
      header={
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-brand-600">
            <FeatherZap className="text-caption-bold font-caption-bold text-neutral-0" />
          </div>
          <span className="text-body-bold font-body-bold text-default-font">RAG LMX</span>
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
      <SidebarWithSections.NavItem icon={<FeatherMessageSquare />} selected>
        Chat
      </SidebarWithSections.NavItem>
      <Link href="/knowledge-base" className="contents">
        <SidebarWithSections.NavItem icon={<FeatherDatabase />} selected={false}>
          Knowledge Base
        </SidebarWithSections.NavItem>
      </Link>
      <SidebarWithSections.NavItem icon={<FeatherSettings />} selected={false}>
        Settings
      </SidebarWithSections.NavItem>
      <SidebarWithSections.NavItem icon={<FeatherLayoutDashboard />} selected={false}>
        Admin
      </SidebarWithSections.NavItem>

      <div className="flex w-full flex-col items-start gap-4 pt-6">
        <div className="flex w-full flex-col items-start gap-2">
          <span className="text-caption-bold font-caption-bold text-subtext-color px-3">
            Upload Files
          </span>
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
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isIngesting}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-neutral-border bg-neutral-50 px-4 py-6 cursor-pointer transition-colors hover:border-brand-primary hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading || isIngesting ? (
              <>
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-default-background">
                  <div className="w-4 h-4 rounded-full border-2 border-neutral-200 border-t-brand-600 animate-spin" />
                </div>
                <span className="text-caption-bold font-caption-bold text-default-font text-center">
                  {isIngesting ? "Processing…" : "Uploading…"}
                </span>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-default-background">
                  <FeatherUploadCloud className="text-body font-body text-subtext-color" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-caption-bold font-caption-bold text-default-font text-center">
                    Drop files or click to browse
                  </span>
                  <span className="font-['Public_Sans'] text-[10px] font-[400] leading-[15px] text-subtext-color text-center">
                    PDF, DOCX, TXT, MD, CSV
                  </span>
                </div>
              </>
            )}
          </button>
          {error && (
            <p className="text-[11px] text-error-600 px-1">{error}</p>
          )}
        </div>

        {files.length > 0 && (
          <SidebarFileList files={files} onDelete={onDeleteFile} />
        )}
      </div>
    </SidebarWithSections>
  );
}
