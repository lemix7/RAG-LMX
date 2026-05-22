"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  FeatherMessageSquare,
  FeatherMoreHorizontal,
} from "@subframe/core";
import { getModel } from "@/lib/api";

interface ChatTopBarProps {
  onMenuClick?: () => void;
}

export function ChatTopBar({ onMenuClick }: ChatTopBarProps) {
  const [model, setModel] = useState<string>("");

  useEffect(() => {
    getModel().then(setModel).catch(() => {});
  }, []);

  return (
    <div
      style={{
        display: "flex",
        height: 56,
        width: "100%",
        flexShrink: 0,
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #1f2228",
        padding: "0 16px",
        background: "#0c0c0b",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Hamburger — mobile only */}
        <button
          className="hamburger-btn md:hidden"
          onClick={onMenuClick}
          style={{ background: "none", border: "none", color: "#7d8187", cursor: "pointer", alignItems: "center", padding: 4, marginRight: 4, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#7d8187")}
          aria-label="Open sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          <FeatherMessageSquare style={{ width: 16, height: 16, color: "#ffffff" }} />
          <span style={{ fontSize: 16, fontFamily: "var(--font-inter), ui-sans-serif, sans-serif", fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>
            Document Assistant
          </span>
        </motion.div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {model && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{
            fontSize: 11,
            fontFamily: "var(--font-space-mono), ui-monospace, monospace",
            letterSpacing: "0.08em",
            color: "#7d8187",
            border: "1px solid #1f2228",
            borderRadius: 9999,
            padding: "3px 10px",
            background: "transparent",
          }}>
            {model}
          </motion.span>
        )}
        <button style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
          <FeatherMoreHorizontal style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}
