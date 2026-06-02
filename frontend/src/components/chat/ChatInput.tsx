"use client";

import { useRef, useState, useCallback, KeyboardEvent } from "react";
import { motion } from "motion/react";
import { FeatherArrowUp, FeatherPaperclip, FeatherMic, FeatherLoader } from "@subframe/core";
import { useVoiceInput } from "@/lib/useVoiceInput";

interface ChatInputProps {
  isStreaming: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSend: (message: string, opts?: { fromVoice?: boolean }) => void;
}

export function ChatInput({ isStreaming, fileInputRef, onSend }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Tracks whether the current input text came from voice — used to auto-play the reply.
  const cameFromVoice = useRef(false);
  const { isRecording, isTranscribing, error: voiceError, startRecording, stopRecording } =
    useVoiceInput();

  const handleSend = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed, { fromVoice: cameFromVoice.current });
    cameFromVoice.current = false;
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [inputValue, isStreaming, onSend]);

  // Mic: tap to start, tap to stop. The transcript lands in the input box so the
  // user can review and edit before sending.
  const handleMicClick = useCallback(async () => {
    if (isStreaming || isTranscribing) return;
    if (isRecording) {
      const text = await stopRecording();
      if (text) {
        setInputValue((prev) => (prev ? `${prev} ${text}` : text));
        cameFromVoice.current = true;
        requestAnimationFrame(() => textareaRef.current?.focus());
      }
    } else {
      await startRecording();
    }
  }, [isStreaming, isTranscribing, isRecording, stopRecording, startRecording]);

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
    <div className="chat-input-wrap" style={{ display: "flex", width: "100%", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 24px 20px" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, scale: focused ? 1.01 : 1 }}
        transition={{
          opacity: { duration: 0.35, ease: "easeOut" },
          y: { duration: 0.35, ease: "easeOut" },
          scale: { type: "spring", stiffness: 300, damping: 25 },
        }}
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 720,
          alignItems: "flex-end",
          gap: 8,
          background: "#0c0c0b",
          border: `1px solid ${focused ? "#2563eb" : "#1f2228"}`,
          borderRadius: 24,
          padding: "12px 16px",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: "none",
            border: "none",
            color: "#a0a4ab",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 4,
            flexShrink: 0,
            marginBottom: 2,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a4ab")}
        >
          <FeatherPaperclip style={{ width: 15, height: 15 }} />
        </button>

        <motion.button
          onClick={handleMicClick}
          disabled={isStreaming || isTranscribing}
          aria-label={isRecording ? "Stop recording" : "Record voice message"}
          animate={isRecording ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={isRecording ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.15 }}
          style={{
            background: "none",
            border: "none",
            color: isRecording ? "#f05070" : "#a0a4ab",
            cursor: isStreaming || isTranscribing ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            padding: 4,
            flexShrink: 0,
            marginBottom: 2,
            transition: "color 0.15s",
            opacity: isStreaming || isTranscribing ? 0.5 : 1,
          }}
          onMouseEnter={(e) => { if (!isRecording) e.currentTarget.style.color = "#ffffff"; }}
          onMouseLeave={(e) => { if (!isRecording) e.currentTarget.style.color = "#a0a4ab"; }}
        >
          {isTranscribing ? (
            <FeatherLoader className="animate-spin" style={{ width: 15, height: 15 }} />
          ) : (
            <FeatherMic style={{ width: 15, height: 15 }} />
          )}
        </motion.button>

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // Manual typing means it's no longer a pure voice question.
            cameFromVoice.current = false;
          }}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isStreaming}
          rows={1}
          placeholder={
            isStreaming
              ? "Waiting for response…"
              : isRecording
              ? "Listening… tap the mic to stop"
              : isTranscribing
              ? "Transcribing…"
              : "Ask a question about your documents..."
          }
          style={{
            flex: 1,
            resize: "none",
            overflow: "hidden",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: 15,
            fontFamily: "var(--font-inter), ui-sans-serif, sans-serif",
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.5,
            color: "#ffffff",
            minHeight: 24,
            maxHeight: 160,
          }}
        />

        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          animate={{ scale: canSend ? 1 : 0.85 }}
          whileHover={canSend ? { scale: 1.12 } : undefined}
          whileTap={canSend ? { scale: 0.9 } : undefined}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9999,
            background: canSend ? "#ffffff" : "#1f2228",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: canSend ? "pointer" : "not-allowed",
            flexShrink: 0,
            transition: "background 0.15s, opacity 0.15s",
            opacity: canSend ? 1 : 0.35,
          }}
        >
          <FeatherArrowUp style={{ width: 14, height: 14, color: canSend ? "#0c0c0b" : "#a0a4ab" }} />
        </motion.button>
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        style={{
          fontSize: 11,
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          color: "#a0a4ab",
          textAlign: "center",
        }}
      >
        {voiceError ? voiceError : "Enter to send · Shift+Enter for new line"}
      </motion.span>
    </div>
  );
}
