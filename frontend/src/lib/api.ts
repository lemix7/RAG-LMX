import type { FilesResponse, IngestResponse, UploadResponse } from "./types";

// ─── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Returns the raw Response so the caller can stream it.
 */
export async function sendChat(question: string): Promise<Response> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  return response;
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

export async function triggerIngest(): Promise<IngestResponse> {
  const response = await fetch("/api/ingest", { method: "POST" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "Ingest failed");
  }
  return data as IngestResponse;
}

// ─── Files ────────────────────────────────────────────────────────────────────

export async function getFiles(): Promise<FilesResponse> {
  const response = await fetch("/api/files", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "Failed to load files");
  }
  return data as FilesResponse;
}

export async function getModel(): Promise<string> {
  const response = await fetch("/api/model", { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail ?? "Failed to fetch model");
  return data.model as string;
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
