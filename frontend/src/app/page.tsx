"use client";

import { useState } from "react";
import { useChat } from "@/lib/useChat";
import { useFiles } from "@/lib/useFiles";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { MobileHeader } from "@/components/MobileHeader";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { messages, isStreaming, sendMessage, clearMessages } = useChat();
  const { files, isUploading, isIngesting, ingestMessage, error, uploadFiles } = useFiles();

  return (
    <div className="h-full flex flex-col bg-[#f0f0f3]">
      {/* Mobile top bar */}
      <MobileHeader
        onMenuToggle={() => setSidebarOpen(true)}
        messageCount={messages.length}
      />

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop sidebar — always visible on md+ */}
        <Sidebar
          files={files}
          isUploading={isUploading}
          isIngesting={isIngesting}
          ingestMessage={ingestMessage}
          error={error}
          onFiles={uploadFiles}
          onNewChat={clearMessages}
        />

        {/* Chat area */}
        <main className="flex flex-1 min-h-0 p-4">
          <ChatArea
            messages={messages}
            isStreaming={isStreaming}
            onSend={sendMessage}
          />
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sidebar panel */}
          <div className="md:hidden fixed inset-y-0 left-0 z-50 flex animate-fade-in">
            <Sidebar
              files={files}
              isUploading={isUploading}
              isIngesting={isIngesting}
              ingestMessage={ingestMessage}
              error={error}
              onFiles={uploadFiles}
              onNewChat={clearMessages}
              onClose={() => setSidebarOpen(false)}
              isMobileOverlay
            />
          </div>
        </>
      )}
    </div>
  );
}
