"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import type { Message } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { FeatherMessageSquare } from "@subframe/core";

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
      <div style={{ display: "flex", flex: 1, width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 24px" }}>
        {/* <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#1f2228", border: "1px solid #474747", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FeatherMessageSquare style={{ width: 20, height: 20, color: "#ffffff" }} />
        </div> */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
        >
          <span style={{ fontSize: 20, fontFamily: "var(--font-inter), ui-sans-serif, sans-serif", fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.4, color: "#ffffff", textAlign: "center" }}>
            Ask anything
          </span>
          <span style={{ maxWidth: 280, fontSize: 14, fontFamily: "var(--font-inter), ui-sans-serif, sans-serif", letterSpacing: "-0.025em", lineHeight: 1.5, color: "#7d8187", textAlign: "center" }}>
            Upload documents in the sidebar, then ask questions about them.
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flex: 1, width: "100%", flexDirection: "column", overflowY: "auto", padding: "24px 16px", gap: 16 }}>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
