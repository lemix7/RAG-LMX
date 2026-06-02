"use client";

import { useState, useRef, useCallback } from "react";
import { transcribeAudio } from "./api";

interface UseVoiceInput {
  isRecording: boolean;
  isTranscribing: boolean;
  error: string | null;
  /** Begin capturing microphone audio. */
  startRecording: () => Promise<void>;
  /** Stop capturing, transcribe, and return the recognised text (empty on failure). */
  stopRecording: () => Promise<string>;
}

/**
 * Microphone capture via MediaRecorder. Tap to start, tap to stop; on stop the
 * recorded audio is sent to the backend for transcription and the text returned.
 */
export function useVoiceInput(): UseVoiceInput {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Microphone is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setError("Microphone access was denied.");
      setIsRecording(false);
    }
  }, []);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    const recorder = recorderRef.current;
    if (!recorder) return "";

    // Wait for the recorder to flush its final chunk.
    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      recorder.stop();
    });

    setIsRecording(false);
    cleanupStream();

    if (blob.size === 0) {
      setError("No audio was captured.");
      return "";
    }

    setIsTranscribing(true);
    try {
      const text = await transcribeAudio(blob);
      return text;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed.");
      return "";
    } finally {
      setIsTranscribing(false);
    }
  }, [cleanupStream]);

  return { isRecording, isTranscribing, error, startRecording, stopRecording };
}
