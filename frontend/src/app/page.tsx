"use client";

import { useRef, useState, useCallback, KeyboardEvent } from "react";
import Link from "next/link";
import { useChat } from "@/lib/useChat";
import { useFiles } from "@/lib/useFiles";
import { MessageList } from "@/components/MessageList";
import { Avatar } from "@/ui/components/Avatar";
import { IconButton } from "@/ui/components/IconButton";
import { SidebarWithSections } from "@/ui/components/SidebarWithSections";
import { FeatherArrowUp } from "@subframe/core";
import { FeatherBrainCircuit } from "@subframe/core";
import { FeatherDatabase } from "@subframe/core";
import { FeatherLayoutDashboard } from "@subframe/core";
import { FeatherMenu } from "@subframe/core";
import { FeatherMessageSquare } from "@subframe/core";
import { FeatherMoreHorizontal } from "@subframe/core";
import { FeatherPlus } from "@subframe/core";
import { FeatherSettings } from "@subframe/core";
import { FeatherUploadCloud } from "@subframe/core";
import { FeatherTrash2 } from "@subframe/core";
import { FeatherFile, FeatherFileText, FeatherZap } from "@subframe/core";
import { SidebarFileList } from "@/components/SidebarFileList";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, isStreaming, sendMessage, clearMessages } = useChat();
  const { files, isUploading, isIngesting, error, uploadFiles, deleteFile } = useFiles();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [inputValue, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const canSend = inputValue.trim().length > 0 && !isStreaming;

  const sidebar = (
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

      {/* Upload section */}
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
              if (e.target.files) uploadFiles(e.target.files);
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

        {/* File list */}
        {files.length > 0 && (
          <SidebarFileList files={files} onDelete={deleteFile} />
        )}
      </div>
    </SidebarWithSections>
  );

  return (
    <div className="flex h-full w-full items-start bg-default-background">
      {/* Desktop sidebar */}
      <div className="flex items-start self-stretch mobile:hidden">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="hidden mobile:block fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="hidden mobile:flex fixed inset-y-0 left-0 z-50 animate-fade-in">
            {sidebar}
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch overflow-hidden bg-default-background">
        {/* Top bar */}
        <div className="flex h-14 w-full flex-none items-center justify-between border-b border-solid border-neutral-border bg-default-background px-6 mobile:px-4">
          <div className="flex items-center gap-3">
            <IconButton
              className="hidden mobile:flex"
              variant="neutral-tertiary"
              icon={<FeatherMenu />}
              onClick={() => setSidebarOpen(true)}
            />
            <div className="hidden items-center gap-2 mobile:flex">
              <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-brand-600">
                <FeatherBrainCircuit className="text-caption-bold font-caption-bold text-neutral-950" />
              </div>
            </div>
            <FeatherMessageSquare className="text-heading-3 font-heading-3 text-brand-700 mobile:hidden" />
            <span className="text-heading-2 font-heading-2 text-default-font">Document Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-caption font-caption text-success-500 rounded-md border border-solid border-success-400 bg-success-50 px-2 py-1">
              GPT-4 Turbo
            </span>
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherMoreHorizontal />}
              onClick={() => {}}
            />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col items-center overflow-hidden">
          <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col items-center overflow-hidden  border border-solid border-neutral-border bg-default-background shadow-sm">
            {/* Messages */}
            <MessageList messages={messages} />

            {/* Input */}
            <div className="flex w-full flex-col items-center gap-2 border-t border-solid border-neutral-border px-6 py-4">
              <div className="flex w-full items-center gap-2 rounded-xl border border-solid border-neutral-border bg-default-background px-4 py-3 transition-all focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
                <IconButton
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherPlus />}
                  onClick={() => fileInputRef.current?.click()}
                />
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  disabled={isStreaming}
                  rows={1}
                  placeholder={isStreaming ? "Waiting for response…" : "Ask a question about your documents..."}
                  className="min-h-[24px] grow shrink-0 basis-0 resize-none overflow-hidden bg-transparent text-body font-body text-default-font outline-none placeholder:text-subtext-color disabled:cursor-not-allowed"
                />
                <IconButton
                  className="bg-brand-100 rounded-md"
                  variant="neutral-tertiary"
                  size="small"
                  icon={<FeatherArrowUp />}
                  disabled={!canSend}
                  onClick={handleSend}
                />
              </div>
              <span className="text-caption font-caption text-subtext-color text-center">
                Press Enter to send · Shift+Enter for new line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
