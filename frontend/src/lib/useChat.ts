"use client";

import { useState, useCallback, useEffect } from "react";
import type { Message, Source, Conversation } from "./types";
import { sendChat } from "./api";
import { parseStream } from "./parseStream";
import {
  listConversations,
  createConversation,
  getMessages,
  saveMessage,
  renameConversation as renameConversationDb,
  deleteConversation as deleteConversationDb,
  touchConversation,
  deriveTitle,
} from "./conversations";

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the conversation list on mount.
  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await listConversations());
    } catch {
      // Not signed in yet or transient error — list stays empty.
    }
  }, []);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Switch to an existing conversation and load its messages.
  const loadConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    setError(null);
    try {
      setMessages(await getMessages(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
      setMessages([]);
    }
  }, []);

  // Start a fresh, unsaved chat (persisted lazily on first message).
  const newChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  const renameConversation = useCallback(async (id: string, title: string) => {
    await renameConversationDb(id, title);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await deleteConversationDb(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    },
    [activeConversationId]
  );

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isStreaming) return;

      setError(null);

      // Ensure a conversation exists; create one lazily on the first message.
      let convId = activeConversationId;
      if (!convId) {
        try {
          const conv = await createConversation(deriveTitle(trimmed));
          convId = conv.id;
          setActiveConversationId(conv.id);
          setConversations((prev) => [conv, ...prev]);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to start chat");
          return;
        }
      }

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = generateId();
      const assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      // Persist the user turn (best-effort).
      saveMessage(convId, "user", trimmed).catch(() => {});

      try {
        const response = await sendChat(trimmed);

        if (!response.ok) {
          const errData = await response
            .json()
            .catch(() => ({ detail: "Chat request failed" }));
          throw new Error(errData.detail ?? "Chat request failed");
        }

        let accumulatedContent = "";
        let resolvedSources: Source[] | undefined;

        for await (const event of parseStream(response)) {
          if (event.type === "token") {
            accumulatedContent += event.content;
            const snapshot = accumulatedContent;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: snapshot, isStreaming: true } : m
              )
            );
          } else if (event.type === "sources") {
            resolvedSources = event.sources;
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }

        // Finalise the assistant message.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: accumulatedContent, sources: resolvedSources, isStreaming: false }
              : m
          )
        );

        // Persist the assistant turn and float the conversation to the top.
        await saveMessage(convId, "assistant", accumulatedContent, resolvedSources);
        await touchConversation(convId);
        setConversations((prev) => {
          const updatedAt = new Date().toISOString();
          const next = prev.map((c) =>
            c.id === convId ? { ...c, updatedAt } : c
          );
          next.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          return next;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "", error: message, isStreaming: false }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, activeConversationId]
  );

  return {
    conversations,
    activeConversationId,
    messages,
    isStreaming,
    error,
    sendMessage,
    loadConversation,
    newChat,
    renameConversation,
    deleteConversation,
  };
}
