import type { Message } from "@/lib/types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  onSend: (message: string) => void;
}

export function ChatArea({ messages, isStreaming, onSend }: ChatAreaProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-[16px] border border-[#e0e1e6] shadow-[0px_3px_6px_rgba(0,0,0,0.06)] overflow-hidden">
      <MessageList messages={messages} />
      <div className="border-t border-[#f0f0f3]">
        <ChatInput onSend={onSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
