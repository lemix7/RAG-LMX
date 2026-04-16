"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, disabled, onSend]);

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

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-end gap-2 bg-white border border-[#e0e1e6] rounded-[16px] px-3 py-2.5 shadow-[0px_3px_6px_rgba(0,0,0,0.06)] transition-shadow focus-within:shadow-[0px_3px_12px_rgba(0,0,0,0.12)] focus-within:border-[#d9d9e0]">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? "Waiting for response…" : "Ask a question about your documents…"}
          className="flex-1 resize-none overflow-hidden bg-transparent text-[15px] text-[#1c2024] placeholder:text-[#b0b4ba] leading-[1.55] outline-none min-h-[24px] max-h-[160px] font-[400] disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
            canSend
              ? "bg-[#000000] text-white hover:bg-[#1c2024] active:scale-95"
              : "bg-[#f0f0f3] text-[#b0b4ba] cursor-not-allowed"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 12V2M7 2L3 6M7 2L11 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <p className="text-center text-[11px] text-[#b0b4ba] mt-2">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
