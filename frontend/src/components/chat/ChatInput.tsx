"use client";

import { useRef, useState, useCallback, KeyboardEvent } from "react";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherArrowUp, FeatherPlus } from "@subframe/core";

interface ChatInputProps {
  isStreaming: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSend: (message: string) => void;
}

export function ChatInput({ isStreaming, fileInputRef, onSend }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [inputValue, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const canSend = inputValue.trim().length > 0 && !isStreaming;

  return (
    <div className="flex w-full flex-col items-center gap-2 px-6 py-4">
      <div className="flex w-full items-center gap-2 rounded-xl border border-solid border-neutral-border bg-default-background px-4 py-3 transition-all focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
        <IconButton
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherPlus />}
          onClick={() => fileInputRef.current?.click()}
        />
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={isStreaming}
          rows={1}
          placeholder={isStreaming ? "Waiting for response…" : "Ask a question about your documents..."}
          className="min-h-[24px] grow shrink-0 basis-0 resize-none overflow-hidden bg-transparent text-body font-body text-default-font outline-none placeholder:text-subtext-color disabled:cursor-not-allowed"
        />
        <IconButton
          className="bg-brand-100 rounded-md"
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherArrowUp />}
          disabled={!canSend}
          onClick={handleSend}
        />
      </div>
      <span className="text-caption font-caption text-subtext-color text-center">
        Press Enter to send · Shift+Enter for new line
      </span>
    </div>
  );
}
