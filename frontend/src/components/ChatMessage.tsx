import type { Message } from "@/lib/types";
import { SourceAttribution } from "./SourceAttribution";
import ReactMarkdown from "react-markdown";
import { FeatherBot } from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }} className="animate-fade-in">
        <div style={{ maxWidth: "72%" }}>
          <div style={{
            background: "#1f2228",
            border: "1px solid #474747",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "18px 18px 4px 18px",
            fontSize: 15,
            fontFamily: FONT,
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.5,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}>
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }} className="animate-fade-in">
      <div style={{ maxWidth: "80%", display: "flex", alignItems: "flex-start", gap: 10 }}>
        {/* Bot avatar */}
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#1f2228", border: "1px solid #1a3568", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
          <FeatherBot style={{ width: 14, height: 14, color: "#2563eb" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {message.error ? (
            <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", background: "#0c0c0b", border: "1px solid #1f2228" }}>
              <p style={{ fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#f05070", margin: 0 }}>⚠ {message.error}</p>
            </div>
          ) : (
            <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", background: "#0c0c0b", border: "1px solid #1f2228" }}>
              {message.content ? (
                <div style={{ fontSize: 15, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.6, color: "#ffffff", wordBreak: "break-word" }} className="prose prose-sm max-w-none prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  {message.isStreaming && <span className="cursor-blink ml-0.5" />}
                </div>
              ) : message.isStreaming ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#474747", display: "inline-block", animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {!message.isStreaming && message.sources && message.sources.length > 0 && (
            <SourceAttribution sources={message.sources} />
          )}
        </div>
      </div>
    </div>
  );
}
