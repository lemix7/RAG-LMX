"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  hint?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

export function InputField({ label, type = "text", placeholder, icon, hint, value, onChange, disabled, error }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const borderColor = error ? "#dc2626" : focused ? "#2563eb" : hovered ? "#474747" : "#1f2228";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <motion.label
        animate={{ color: focused ? "#ffffff" : "#7d8187" }}
        transition={{ duration: 0.15 }}
        style={{ fontSize: 15, fontFamily: FONT, fontWeight: 400, lineHeight: 1.5 }}
      >
        {label}
      </motion.label>

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* Animated glow ring behind the input */}
        <AnimatePresence>
          {focused && (
            <motion.span
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute",
                inset: -2,
                borderRadius: 14,
                background: "rgba(37, 99, 235, 0.12)",
                pointerEvents: "none",
                zIndex: 0,
              }}
            />
          )}
        </AnimatePresence>

        {icon && (
          <motion.span
            animate={{ color: focused ? "#2563eb" : "#474747" }}
            transition={{ duration: 0.2 }}
            style={{ position: "absolute", left: 16, display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1 }}
          >
            {icon}
          </motion.span>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: "100%",
            background: "#0c0c0b",
            color: "#ffffff",
            border: `1px solid ${borderColor}`,
            borderRadius: 12,
            padding: icon ? "12px 16px 12px 44px" : "12px 16px",
            fontSize: 15,
            fontFamily: FONT,
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.5,
            outline: "none",
            transition: "border-color 0.15s",
            boxSizing: "border-box",
            position: "relative",
            zIndex: 1,
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
      </div>

      <AnimatePresence>
        {hint && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: 11, color: error ? "#dc2626" : "#474747", fontFamily: MONO, letterSpacing: "0.06em", lineHeight: 1.6, margin: 0, overflow: "hidden" }}
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
