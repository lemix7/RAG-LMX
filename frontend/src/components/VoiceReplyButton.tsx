"use client";

import { useEffect, useRef, useState } from "react";
import { FeatherVolume2, FeatherSquare, FeatherLoader } from "@subframe/core";
import { synthesizeSpeech } from "@/lib/api";

interface VoiceReplyButtonProps {
  text: string;
  autoPlay?: boolean;
}

export function VoiceReplyButton({ text, autoPlay = false }: VoiceReplyButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "failed">("idle");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const autoPlayedRef = useRef(false);

  async function playAudio() {
    // Stop if already playing
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setStatus("idle");
      return;
    }

    try {
      // Fetch and cache the audio blob on first play
      if (!urlRef.current) {
        setStatus("loading");
        const blob = await synthesizeSpeech(text);
        urlRef.current = URL.createObjectURL(blob);
      }

      const audio = new Audio(urlRef.current);
      audioRef.current = audio;

      audio.onended = () => setStatus("idle");
      audio.onerror = () => setStatus("failed");

      setStatus("playing");
      await audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
      setStatus("failed");
    }
  }

  // Auto-play once when the answer is from a voice question
  useEffect(() => {
    if (autoPlay && !autoPlayedRef.current && text.trim()) {
      autoPlayedRef.current = true;
      playAudio();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current);
        urlRef.current = null;
      }
    };
  }, []);

  const title =
    status === "failed" ? "Voice unavailable" :
    status === "playing" ? "Stop" :
    status === "loading" ? "Loading…" :
    "Play reply";

  return (
    <button
      onClick={playAudio}
      disabled={status === "loading" || status === "failed"}
      aria-label={title}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 6,
        padding: "2px 4px",
        background: "none",
        border: "none",
        color: status === "failed" ? "#7d8187" : status === "playing" ? "#2563eb" : "#a0a4ab",
        cursor: status === "loading" || status === "failed" ? "default" : "pointer",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (status === "idle") e.currentTarget.style.color = "#ffffff";
      }}
      onMouseLeave={(e) => {
        if (status === "idle") e.currentTarget.style.color = "#a0a4ab";
        if (status === "playing") e.currentTarget.style.color = "#2563eb";
      }}
    >
      {status === "loading" ? (
        <FeatherLoader className="animate-spin" style={{ width: 13, height: 13 }} />
      ) : status === "playing" ? (
        <FeatherSquare style={{ width: 13, height: 13 }} />
      ) : (
        <FeatherVolume2 style={{ width: 13, height: 13 }} />
      )}
    </button>
  );
}
