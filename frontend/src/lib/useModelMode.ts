"use client";

import { useState, useCallback, useEffect } from "react";

export type ModelMode = "public" | "local";

const STORAGE_KEY = "editorMode";

/**
 * Tracks whether the chat uses the public (OpenAI) or local (Ollama, private)
 * editor model. The choice is per-browser, persisted in localStorage, and sent
 * with each chat/ingest request so the backend picks the matching model and
 * vector collection.
 */
export function useModelMode() {
  const [mode, setMode] = useState<ModelMode>("public");

  // Read the persisted choice after mount (localStorage is client-only).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "local" || stored === "public") {
      setMode(stored);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === "public" ? "local" : "public";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { mode, toggleMode };
}
