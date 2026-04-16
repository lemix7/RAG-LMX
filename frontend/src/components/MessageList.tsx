"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#f0f0f3] border border-[#e0e1e6] flex items-center justify-center mb-4">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 2C5.58 2 2 5.13 2 9c0 2.04.92 3.87 2.4 5.18L4 17l3.3-1.32C8.14 16 9.05 16.25 10 16.25 14.42 16.25 18 13.12 18 9S14.42 2 10 2Z"
              stroke="#b0b4ba"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </div>
        <p className="text-[15px] font-[600] text-[#1c2024] mb-1">Ask anything</p>
        <p className="text-[13px] text-[#b0b4ba] max-w-[260px] leading-[1.55]">
          Upload documents in the sidebar, then ask questions about them.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
