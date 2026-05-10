import type { Message } from "@/lib/types";
import { SourceAttribution } from "./SourceAttribution";
import ReactMarkdown from "react-markdown";
import { FeatherBrainCircuit } from "@subframe/core";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[75%]">
          <div className="bg-brand-600 text-neutral-0 px-4 py-2.5 rounded-[18px] rounded-br-[4px] text-body font-body whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%]">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 shrink-0 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-brand-50 border border-solid border-brand-200">
            <FeatherBrainCircuit className="text-[10px] text-brand-700" />
          </div>

          <div className="flex-1 min-w-0">
            {message.error ? (
              <div className="px-4 py-2.5 rounded-[18px] rounded-bl-[4px] bg-default-background border border-solid border-neutral-border shadow-sm">
                <p className="text-body font-body text-warning-700">⚠️ {message.error}</p>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-[18px] rounded-bl-[4px] bg-default-background border border-solid border-neutral-border shadow-sm">
                {message.content ? (
                  <div className="text-body font-body text-default-font break-words prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    {message.isStreaming && <span className="cursor-blink ml-0.5" />}
                  </div>
                ) : message.isStreaming ? (
                  <div className="flex items-center gap-1 py-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-neutral-400"
                        style={{ animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite` }}
                      />
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
    </div>
  );
}
