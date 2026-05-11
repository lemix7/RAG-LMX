"use client";

import { useRef, useState } from "react";
import { useChat } from "@/lib/useChat";
import { useFiles } from "@/lib/useFiles";
import { MessageList } from "@/components/MessageList";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatTopBar } from "@/components/chat/ChatTopBar";
import { ChatInput } from "@/components/chat/ChatInput";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, isStreaming, sendMessage } = useChat();
  const { files, isUploading, isIngesting, error, uploadFiles, deleteFile } = useFiles();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sidebar = (
    <ChatSidebar
      files={files}
      isUploading={isUploading}
      isIngesting={isIngesting}
      error={error}
      fileInputRef={fileInputRef}
      onUploadFiles={uploadFiles}
      onDeleteFile={deleteFile}
    />
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
        <ChatTopBar onMenuOpen={() => setSidebarOpen(true)} />

        <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col items-center overflow-hidden">
          <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col items-center overflow-hidden border border-solid border-neutral-border bg-default-background shadow-sm">
            <MessageList messages={messages} />
            <ChatInput
              isStreaming={isStreaming}
              fileInputRef={fileInputRef}
              onSend={sendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
