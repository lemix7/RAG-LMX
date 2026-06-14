"use client";

import { useRef, useState } from "react";
import { useChat } from "@/lib/useChat";
import { useFiles } from "@/lib/useFiles";
import { useModelMode } from "@/lib/useModelMode";
import { MessageList } from "@/components/MessageList";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatTopBar } from "@/components/chat/ChatTopBar";
import { ChatInput } from "@/components/chat/ChatInput";

export default function Home() {
  const { mode, toggleMode } = useModelMode();
  const {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    sendMessage,
    loadConversation,
    newChat,
    renameConversation,
    deleteConversation,
  } = useChat(mode);
  const { files, isUploading, isIngesting, error, uploadFiles, deleteFile } = useFiles(mode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chats = {
    conversations,
    activeConversationId,
    onSelect: loadConversation,
    onNewChat: newChat,
    onRename: renameConversation,
    onDelete: deleteConversation,
  };

  const uploadConfig = {
    files,
    isUploading,
    isIngesting,
    error,
    fileInputRef,
    onUploadFiles: uploadFiles,
    onDeleteFile: deleteFile,
  };

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "flex-start", background: "#0c0c0b", overflow: "hidden" }}>

      {/* Sidebar — hidden on mobile, always visible md+ */}
      <div className="hidden md:flex" style={{ alignSelf: "stretch" }}>
        <AppSidebar upload={uploadConfig} chats={chats} />
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
            <AppSidebar
              upload={uploadConfig}
              chats={chats}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "hidden", minWidth: 0 }}>
        <ChatTopBar onMenuClick={() => setSidebarOpen(true)} mode={mode} onToggleMode={toggleMode} />

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
