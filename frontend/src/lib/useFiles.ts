"use client";

import { useState, useCallback, useEffect } from "react";
import type { FileInfo, ModelMode } from "./types";
import { uploadFile, triggerIngest, getFiles, deleteFile as apiDeleteFile } from "./api";

export function useFiles(mode: ModelMode = "public") {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestMessage, setIngestMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshFiles = useCallback(async () => {
    try {
      const data = await getFiles(mode);
      setFiles(
        data.files.map((f) => ({
          name: f.name,
          size: f.size,
          ingested: f.ingested,
          status: f.ingested ? "ingested" : "uploaded",
        }))
      );
    } catch {
      // Silently fail on refresh — backend may not be running yet
    }
  }, [mode]);

  // Load files on mount and whenever the mode changes (ingested flag is per-mode).
  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const uploadFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesToUpload = Array.from(fileList);
      if (filesToUpload.length === 0) return;

      setError(null);
      setIsUploading(true);

      // Optimistically add files with "uploading" status
      setFiles((prev) => {
        const existingNames = new Set(prev.map((f) => f.name));
        const newEntries: FileInfo[] = filesToUpload
          .filter((f) => !existingNames.has(f.name))
          .map((f) => ({
            name: f.name,
            size: f.size,
            ingested: false,
            status: "uploading",
          }));
        return [...prev, ...newEntries];
      });

      let uploadedCount = 0;
      const errors: string[] = [];

      for (const file of filesToUpload) {
        try {
          await uploadFile(file);
          uploadedCount++;
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: "uploaded" } : f
            )
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          errors.push(`${file.name}: ${msg}`);
          setFiles((prev) =>
            prev.map((f) =>
              f.name === file.name ? { ...f, status: "error", errorMessage: msg } : f
            )
          );
        }
      }

      setIsUploading(false);

      if (errors.length > 0) {
        setError(errors.join("; "));
      }

      // Auto-ingest if at least one file uploaded successfully
      if (uploadedCount > 0) {
        setIsIngesting(true);
        setIngestMessage(null);

        // Mark all freshly uploaded files as "ingesting"
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "uploaded" ? { ...f, status: "ingesting" } : f
          )
        );

        try {
          const result = await triggerIngest(mode);
          setIngestMessage(result.message);
          await refreshFiles();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Ingest failed";
          setError((prev) => (prev ? `${prev}; ${msg}` : msg));
          // Revert ingesting → uploaded on error
          setFiles((prev) =>
            prev.map((f) =>
              f.status === "ingesting" ? { ...f, status: "uploaded" } : f
            )
          );
        } finally {
          setIsIngesting(false);
        }
      }
    },
    [refreshFiles, mode]
  );

  const deleteFile = useCallback(
    async (fileName: string) => {
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
      try {
        await apiDeleteFile(fileName);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Delete failed";
        setError(msg);
        await refreshFiles();
      }
    },
    [refreshFiles]
  );

  const removeError = useCallback(() => setError(null), []);

  return {
    files,
    isUploading,
    isIngesting,
    ingestMessage,
    error,
    uploadFiles,
    deleteFile,
    refreshFiles,
    removeError,
  };
}
