import { createClient } from "@/lib/supabase/client";
import type { Conversation, Message, Source } from "./types";

/** Shape of a row in the `messages` table. */
interface MessageRow {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources: Source[] | null;
}

/** Shape of a row in the `conversations` table. */
interface ConversationRow {
  id: string;
  title: string;
  updated_at: string;
}

function toConversation(row: ConversationRow): Conversation {
  return { id: row.id, title: row.title, updatedAt: row.updated_at };
}

/** List the current user's conversations, most recently updated first. */
export async function listConversations(): Promise<Conversation[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ConversationRow[]).map(toConversation);
}

/** Create a new conversation owned by the current user. */
export async function createConversation(title = "New chat"): Promise<Conversation> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: user.id, title })
    .select("id, title, updated_at")
    .single();
  if (error) throw new Error(error.message);
  return toConversation(data as ConversationRow);
}

/** Fetch all messages for a conversation in chronological order. */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content, sources")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);

  return (data as MessageRow[]).map((row) => ({
    id: row.id,
    role: row.role,
    content: row.content,
    sources: row.sources ?? undefined,
  }));
}

/** Persist a single message. */
export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  sources?: Source[]
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    role,
    content,
    sources: sources ?? null,
  });
  if (error) throw new Error(error.message);
}

/** Rename a conversation (also bumps updated_at via touch on the caller side). */
export async function renameConversation(id: string, title: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Delete a conversation (messages cascade). */
export async function deleteConversation(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Bump updated_at so the conversation floats to the top of the list. */
export async function touchConversation(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/** Derive a short title from the first user message. */
export function deriveTitle(question: string): string {
  const trimmed = question.trim().replace(/\s+/g, " ");
  return trimmed.length > 40 ? `${trimmed.slice(0, 40)}…` : trimmed || "New chat";
}
