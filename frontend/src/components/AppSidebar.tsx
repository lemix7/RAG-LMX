"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { SidebarFileList } from "@/components/SidebarFileList";
import {
  FeatherActivity,
  FeatherBarChart2,
  FeatherDatabase,
  FeatherFileText,
  FeatherLayoutDashboard,
  FeatherLayers,
  FeatherLogOut,
  FeatherMessageSquare,
  FeatherPlus,
  FeatherSettings,
  FeatherShield,
  FeatherTrash2,
  FeatherUploadCloud,
  FeatherUser,
  FeatherUsers,
  FeatherX,
} from "@subframe/core";
import { useAuth } from "@/lib/useAuth";
import type { Conversation, FileInfo } from "@/lib/types";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  href?: string;
  index?: number;
}

function NavItem({ icon, label, selected, href, index = 0 }: NavItemProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        background: selected ? "#2463EB" : "transparent",
        color: selected ? "#ffffff" : "#a0a4ab",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        fontSize: 15,
        fontFamily: FONT,
        letterSpacing: "-0.025em",
        userSelect: "none",
      }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.background = "#1f2228"; e.currentTarget.style.color = "#ffffff"; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a0a4ab"; } }}
    >
      <span style={{ width: 15, height: 15, display: "flex", alignItems: "center", flexShrink: 0, color: selected ? "#ffffff" : "#a0a4ab" }}>
        {icon}
      </span>
      {label}
    </motion.div>
  );

  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  return content;
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#474747", textTransform: "uppercase", padding: "8px 12px 4px" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

interface UploadConfig {
  files: FileInfo[];
  isUploading: boolean;
  isIngesting: boolean;
  error?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadFiles: (files: FileList) => void;
  onDeleteFile: (name: string) => void;
}

interface ChatsConfig {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

interface AppSidebarProps {
  /** "main" shows the top-level nav; "admin" shows the admin-only nav. */
  variant?: "main" | "admin";
  /** When provided, renders the file upload control + file list (chat page). */
  upload?: UploadConfig;
  /** When provided, renders the saved-conversation list (chat page). */
  chats?: ChatsConfig;
  onClose?: () => void;
}

function ChatList({ chats }: { chats: ChatsConfig }) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const commitRename = (id: string) => {
    const title = draftTitle.trim();
    if (title) chats.onRename(id, title);
    setRenamingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px 4px" }}>
        <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#474747", textTransform: "uppercase" }}>
          Chats
        </span>
        <button
          onClick={chats.onNewChat}
          aria-label="New chat"
          style={{ background: "none", border: "none", color: "#a0a4ab", cursor: "pointer", display: "flex", alignItems: "center", padding: 2, borderRadius: 4, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#a0a4ab")}
        >
          <FeatherPlus style={{ width: 15, height: 15 }} />
        </button>
      </div>

      {chats.conversations.length === 0 && (
        <span style={{ fontSize: 12, fontFamily: FONT, color: "#474747", padding: "4px 12px", letterSpacing: "-0.025em" }}>
          No chats yet
        </span>
      )}

      {chats.conversations.map((c) => {
        const selected = c.id === chats.activeConversationId;
        return (
          <div
            key={c.id}
            onClick={() => renamingId !== c.id && chats.onSelect(c.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              background: selected ? "#2463EB" : "transparent",
              color: selected ? "#ffffff" : "#a0a4ab",
              cursor: "pointer",
              fontSize: 14,
              fontFamily: FONT,
              letterSpacing: "-0.025em",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.background = "#1f2228"; e.currentTarget.style.color = "#ffffff"; } }}
            onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a0a4ab"; } }}
          >
            <FeatherMessageSquare style={{ width: 14, height: 14, flexShrink: 0 }} />
            {renamingId === c.id ? (
              <input
                autoFocus
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                onBlur={() => commitRename(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(c.id);
                  if (e.key === "Escape") setRenamingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{ flex: 1, minWidth: 0, background: "#0c0c0b", color: "#ffffff", border: "1px solid #2563eb", borderRadius: 6, padding: "2px 6px", fontSize: 13, fontFamily: FONT, outline: "none" }}
              />
            ) : (
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.title}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setRenamingId(c.id); setDraftTitle(c.title); }}
              aria-label="Rename chat"
              title="Rename"
              style={{ background: "none", border: "none", color: "inherit", opacity: 0.6, cursor: "pointer", display: "flex", padding: 2 }}
            >
              <FeatherSettings style={{ width: 12, height: 12 }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); chats.onDelete(c.id); }}
              aria-label="Delete chat"
              title="Delete"
              style={{ background: "none", border: "none", color: "inherit", opacity: 0.6, cursor: "pointer", display: "flex", padding: 2 }}
            >
              <FeatherTrash2 style={{ width: 12, height: 12 }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function AppSidebar({ variant = "main", upload, chats, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: 300,
      height: "100%",
      background: "#0c0c0b",
      borderRight: "1px solid #1f2228",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "20px 16px 16px", borderBottom: "1px solid #1f2228" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a3568", border: "1px solid #2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FeatherLayers style={{ width: 15, height: 15, color: "#ffffff" }} />
          </div>
          <span style={{ fontSize: 15, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>RAG LMX</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#7d8187", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, borderRadius: 4, transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#7d8187")}
            aria-label="Close sidebar"
          >
            <FeatherX style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        {variant === "admin" ? (
          <>
            <NavItem icon={<FeatherShield style={{ width: 15, height: 15 }} />} label="Dashboard" href="/admin" selected={pathname === "/admin"} index={0} />

            <div style={{ marginTop: 8 }}>
              <NavSection label="Management">
                <NavItem icon={<FeatherUsers style={{ width: 15, height: 15 }} />} label="Users" href="/admin/users" selected={pathname === "/admin/users"} index={1} />
                <NavItem icon={<FeatherFileText style={{ width: 15, height: 15 }} />} label="Documents" href="/admin/documents" selected={pathname === "/admin/documents"} index={2} />
              </NavSection>
            </div>

            {/* <div style={{ marginTop: 8 }}>
              <NavSection label="Analytics">
                <NavItem icon={<FeatherBarChart2 style={{ width: 15, height: 15 }} />} label="Usage" index={3} />
                <NavItem icon={<FeatherActivity style={{ width: 15, height: 15 }} />} label="Performance" index={4} />
              </NavSection>
            </div> */}
          </>
        ) : (
          <>
            <NavItem icon={<FeatherMessageSquare style={{ width: 15, height: 15 }} />} label="Chat" href="/" selected={pathname === "/"} index={0} />
            <NavItem icon={<FeatherDatabase style={{ width: 15, height: 15 }} />} label="Knowledge Base" href="/knowledge-base" selected={pathname === "/knowledge-base"} index={1} />
            <NavItem icon={<FeatherSettings style={{ width: 15, height: 15 }} />} label="Settings" href="/settings" selected={pathname === "/settings"} index={2} />
            {isAdmin && (
              <NavItem icon={<FeatherLayoutDashboard style={{ width: 15, height: 15 }} />} label="Admin" href="/admin" selected={pathname.startsWith("/admin")} index={3} />
            )}
            {chats && <ChatList chats={chats} />}
          </>
        )}
      </div>

      {/* Upload section (chat page only) */}
      {upload && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.18, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px", borderTop: "1px solid #1f2228" }}
        >
          <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: "#fff", textTransform: "uppercase" }}>
            Upload Files
          </span>

          <input
            ref={upload.fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files) upload.onUploadFiles(e.target.files);
              e.target.value = "";
            }}
          />

          <motion.button
            whileHover={upload.isUploading || upload.isIngesting ? undefined : { scale: 1.02 }}
            whileTap={upload.isUploading || upload.isIngesting ? undefined : { scale: 0.98 }}
            onClick={() => upload.fileInputRef.current?.click()}
            disabled={upload.isUploading || upload.isIngesting}
            onDragOver={(e) => { e.preventDefault(); if (!upload.isUploading && !upload.isIngesting) e.currentTarget.style.borderColor = "#2563eb"; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = "#1f2228"; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = "#1f2228";
              if (!upload.isUploading && !upload.isIngesting && e.dataTransfer.files.length > 0) {
                upload.onUploadFiles(e.dataTransfer.files);
              }
            }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "20px 16px",
              background: "transparent",
              border: "1px dashed #1f2228",
              borderRadius: 8,
              cursor: upload.isUploading || upload.isIngesting ? "not-allowed" : "pointer",
              opacity: upload.isUploading || upload.isIngesting ? 0.6 : 1,
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => { if (!upload.isUploading && !upload.isIngesting) e.currentTarget.style.borderColor = "#474747"; }}
            onMouseLeave={(e) => { if (!upload.isUploading && !upload.isIngesting) e.currentTarget.style.borderColor = "#1f2228"; }}
          >
            {upload.isUploading || upload.isIngesting ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #1f2228", borderTopColor: "#2563eb", animation: "spin 0.8s linear infinite" }} />
                <span style={{ fontSize: 12, fontFamily: FONT, color: "#7d8187", letterSpacing: "-0.025em" }}>
                  {upload.isIngesting ? "Processing…" : "Uploading…"}
                </span>
              </>
            ) : (
              <>
                <FeatherUploadCloud style={{ width: 18, height: 18, color: "#fff" }} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 12, fontFamily: FONT, color: "#ffffff", letterSpacing: "-0.025em", textAlign: "center" }}>
                    Drop files or click to browse
                  </span>
                  <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#a0a4ab", textAlign: "center" }}>
                    PDF · DOC · TXT · MD 
                  </span>
                </div>
              </>
            )}
          </motion.button>

          {upload.error && (
            <p style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#f05070", margin: 0 }}>{upload.error}</p>
          )}
        </motion.div>
      )}

      {/* File list (chat page only) */}
      {upload && upload.files.length > 0 && (
        <div style={{ flex: 1, overflow: "hidden", borderTop: "1px solid #1f2228" }}>
          <SidebarFileList files={upload.files} onDelete={upload.onDeleteFile} />
        </div>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderTop: "1px solid #1f2228", marginTop: "auto" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f2228", border: "1px solid #474747", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FeatherUser style={{ width: 14, height: 14, color: "#7d8187" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.full_name?.trim() || "Account"}
          </span>
          <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#a0a4ab", textTransform: "capitalize" }}>
            {profile?.role ?? "user"}
          </span>
        </div>
        <button
          onClick={signOut}
          aria-label="Sign out"
          title="Sign out"
          style={{ background: "none", border: "none", color: "#a0a4ab", cursor: "pointer", display: "flex", alignItems: "center", padding: 6, borderRadius: 6, transition: "color 0.15s, background 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.background = "#1f2228"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#a0a4ab"; e.currentTarget.style.background = "transparent"; }}
        >
          <FeatherLogOut style={{ width: 15, height: 15 }} />
        </button>
      </div>
    </div>
  );
}
