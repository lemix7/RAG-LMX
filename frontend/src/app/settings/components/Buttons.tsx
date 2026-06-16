import React from "react";
import { motion } from "motion/react";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

export function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
      {children}
    </div>
  );
}

interface GhostButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function GhostButton({ children, onClick, disabled }: GhostButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ opacity: 0.75 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: 9999,
        color: "#ffffff",
        fontSize: 16,
        fontFamily: FONT,
        letterSpacing: "-0.025em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </motion.button>
  );
}

interface FilledButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export function FilledButton({ children, icon, onClick, disabled }: FilledButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ opacity: 0.85 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        background: "#ffffff",
        border: "none",
        borderRadius: 9999,
        color: "#0a0a0a",
        fontSize: 16,
        fontFamily: FONT,
        letterSpacing: "-0.025em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon}
      {children}
    </motion.button>
  );
}
