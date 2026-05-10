"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { FeatherMessageCircle } from "@subframe/core";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col items-center justify-center gap-4 px-6">
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-brand-100">
          <FeatherMessageCircle className="text-heading-2 font-heading-2 text-brand-600" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-heading-3 font-heading-3 text-default-font text-center">
            Ask anything
          </span>
          <span className="max-w-[320px] text-body font-body text-subtext-color text-center">
            Upload documents in the sidebar, then ask questions about them.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full grow shrink-0 basis-0 flex-col overflow-y-auto px-4 py-6 gap-5">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
