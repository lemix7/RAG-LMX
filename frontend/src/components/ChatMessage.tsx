import type { Message } from "@/lib/types";
import { SourceAttribution } from "./SourceAttribution";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[75%]">
          <div className="bg-[#000000] text-white px-4 py-2.5 rounded-[18px] rounded-br-[4px] text-[15px] leading-[1.55] font-[400] whitespace-pre-wrap break-words">
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
          <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-[#f0f0f3] border border-[#e0e1e6] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="4" fill="#000" />
              <circle cx="6" cy="6" r="2" fill="#fff" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {message.error ? (
              <div className="px-4 py-2.5 rounded-[18px] rounded-bl-[4px] bg-white border border-[#e0e1e6] shadow-[0px_3px_6px_rgba(0,0,0,0.08)]">
                <p className="text-[14px] text-[#ab6400] leading-[1.55]">⚠️ {message.error}</p>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-[18px] rounded-bl-[4px] bg-white border border-[#e0e1e6] shadow-[0px_3px_6px_rgba(0,0,0,0.08)]">
                {message.content ? (
                  <p className="text-[15px] text-[#1c2024] leading-[1.55] font-[400] whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && <span className="cursor-blink ml-0.5" />}
                  </p>
                ) : message.isStreaming ? (
                  <div className="flex items-center gap-1 py-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-[#b0b4ba]"
                        style={{ animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }}
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
