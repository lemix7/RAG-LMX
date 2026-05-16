"use client";

import { useRef } from "react";
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

  return (
    <div className="flex h-full w-full items-start bg-default-background">
      {/* Sidebar */}
      <div className="flex items-start self-stretch">
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

      {/* Main content */}
      <div className="flex grow shrink-0 basis-0 flex-col items-start self-stretch overflow-hidden bg-default-background">
        <ChatTopBar />

        <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col items-center overflow-hidden">
          <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col items-center overflow-hidden">
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
