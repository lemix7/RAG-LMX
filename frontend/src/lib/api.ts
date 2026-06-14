import type { FilesResponse, IngestResponse, UploadResponse, ModelInfo, ModelMode } from "./types";

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Returns the raw Response so the caller can stream it.
 * `mode` selects the public (OpenAI) or local (Ollama) editor model.
 */
export async function sendChat(question: string, mode: ModelMode = "public"): Promise<Response> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, mode }),
  });
  return response;
}

// ─── Voice ────────────────────────────────────────────────────────────────────

/**
 * Sends recorded audio to the backend and returns the transcribed text.
 */
export async function transcribeAudio(blob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const data = await response.json().catch(() => ({ detail: "Transcription failed" }));
  if (!response.ok) {
    throw new Error(data.detail ?? "Transcription failed");
  }
  return data.text as string;
}

/**
 * Synthesizes the given text to speech and returns the audio as an MP3 Blob.
 */
export async function synthesizeSpeech(text: string): Promise<Blob> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: "Speech synthesis failed" }));
    throw new Error(data.detail ?? "Speech synthesis failed");
  }
  return response.blob();
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "Upload failed");
  }
  return data as UploadResponse;
}

// ─── Ingest ───────────────────────────────────────────────────────────────────

export async function triggerIngest(mode: ModelMode = "public"): Promise<IngestResponse> {
  const response = await fetch("/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "Ingest failed");
  }
  return data as IngestResponse;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export async function getFiles(mode: ModelMode = "public"): Promise<FilesResponse> {
  const response = await fetch(`/api/files?mode=${mode}`, { cache: "no-store" }); // the chache is disabled
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "Failed to load files");
  }
  return data as FilesResponse;
}

export async function getModel(): Promise<ModelInfo> {
  const response = await fetch("/api/model", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? "Failed to fetch model");
  return { public: data.public, local: data.local } as ModelInfo;
}

export async function deleteFile(fileName: string): Promise<void> {
  const response = await fetch(`/api/files/${encodeURIComponent(fileName)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail ?? "Delete failed");
  }
}
