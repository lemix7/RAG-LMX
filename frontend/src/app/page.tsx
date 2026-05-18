"use client";

import { useRef, useState } from "react";
import { useChat } from "@/lib/useChat";
import { useFiles } from "@/lib/useFiles";
import { MessageList } from "@/components/MessageList";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatTopBar } from "@/components/chat/ChatTopBar";
import { ChatInput } from "@/components/chat/ChatInput";

export default function Home() {
  const { messages, isStreaming, sendMessage } = useChat();
  const { files, isUploading, isIngesting, error, uploadFiles, deleteFile } = useFiles();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "flex-start", background: "#0c0c0b", overflow: "hidden" }}>

      {/* Sidebar — hidden on mobile, always visible md+ */}
      <div className="hidden md:flex" style={{ alignSelf: "stretch" }}>
        <ChatSidebar
          files={files}
          isUploading={isUploading}
          isIngesting={isIngesting}
          error={error}
          fileInputRef={fileInputRef}
          onUploadFiles={uploadFiles}
          onDeleteFile={deleteFile}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden"
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="md:hidden"
            style={{ position: "fixed", inset: 0, right: "auto", zIndex: 50, display: "flex", animation: "slideInLeft 0.2s ease-out" }}
          >
            <ChatSidebar
              files={files}
              isUploading={isUploading}
              isIngesting={isIngesting}
              error={error}
              fileInputRef={fileInputRef}
              onUploadFiles={uploadFiles}
              onDeleteFile={deleteFile}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "hidden", minWidth: 0 }}>
        <ChatTopBar onMenuClick={() => setSidebarOpen(true)} />

        <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
          <MessageList messages={messages} />
          <ChatInput
            isStreaming={isStreaming}
            fileInputRef={fileInputRef}
            onSend={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
