"use client";

import React, { useState } from "react";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export function InputField({ label, type = "text", placeholder, icon, hint }: InputFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <label style={{ fontSize: 15, fontFamily: FONT, fontWeight: 400, lineHeight: 1.5, color: "#7d8187" }}>
        {label}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span style={{ position: "absolute", left: 16, color: "#474747", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "#0c0c0b",
            color: "#ffffff",
            border: `1px solid ${focused ? "#2563eb" : "#1f2228"}`,
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
          }}
          onMouseEnter={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#474747"; }}
          onMouseLeave={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#1f2228"; }}
        />
      </div>
      {hint && (
        <p style={{ fontSize: 11, color: "#474747", fontFamily: MONO, letterSpacing: "0.06em", lineHeight: 1.6, margin: 0 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
