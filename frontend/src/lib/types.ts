// ─── Message Types ────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface Source {
  /** Full path or filename returned by the backend */
  path: string;
  /** Display name — just the filename portion */
  name: string;
  /** Page number for PDFs, null for other file types */
  page?: number | null;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
  error?: string;
  /** True when the question was asked by voice — the reply should auto-play once. */
  fromVoice?: boolean;
}

// ─── Auth / Conversation Types ──────────────────────────────────────────────

export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
}

export interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

// ─── File Types ───────────────────────────────────────────────────────────────

export type FileStatus = "uploading" | "uploaded" | "ingesting" | "ingested" | "error";

export interface FileInfo {
  name: string;
  /** Size in bytes — may be 0 for optimistically-added files */
  size: number;
  ingested: boolean;
  /** Client-side status overlay */
  status: FileStatus;
  errorMessage?: string;
}

// ─── API Response Types ───────────────────────────────────────────────────────

export interface FilesResponse {
  files: Array<{
    name: string;
    ingested: boolean;
    size: number;
  }>;
}

export interface IngestResponse {
  message: string;
}

/** Editor model the chat uses: public = OpenAI (cloud), local = Ollama (private). */
export type ModelMode = "public" | "local";

export interface ModelInfo {
  public: string;
  local: string;
}

export interface UploadResponse {
  message: string;
}

export interface HealthResponse {
  status: "ok" | string;
}

// ─── Stream Event Types ───────────────────────────────────────────────────────

export type StreamEvent =
  | { type: "token"; content: string }
  | { type: "sources"; sources: Source[] }
  | { type: "error"; message: string };
