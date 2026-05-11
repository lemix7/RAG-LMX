import type { FileInfo } from "@/lib/types";

export type FilterType = "All Types" | "PDF" | "DOCX" | "TXT" | "CSV" | "MD";

export const ITEMS_PER_PAGE = 9;

export const FILTER_TYPES: FilterType[] = ["All Types", "PDF", "DOCX", "TXT", "CSV", "MD"];

export function formatSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getExt(name: string): string {
  return (name.split(".").pop() ?? "").toUpperCase();
}

export function getFilterType(name: string): FilterType {
  const ext = getExt(name);
  if (ext === "PDF") return "PDF";
  if (ext === "DOCX" || ext === "DOC") return "DOCX";
  if (ext === "TXT") return "TXT";
  if (ext === "CSV") return "CSV";
  if (ext === "MD") return "MD";
  return "All Types";
}

export function simulateChunks(file: FileInfo): string {
  if (file.status !== "ingested") return "—";
  const seed = file.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return String(Math.max(10, Math.floor(file.size / 1024 / 5 + (seed % 200))));
}

export function simulateDate(file: FileInfo): string {
  const seed = file.name.length * 7 + (file.size % 30);
  const month = ["Jan", "Feb", "Mar", "Apr", "May"][seed % 5];
  const day = (seed % 28) + 1;
  return `${month} ${day}, 2026`;
}
