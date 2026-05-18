"use client";

import { FeatherSettings } from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface SettingsHeaderProps {
  onMenuClick?: () => void;
}

export function SettingsHeader({ onMenuClick }: SettingsHeaderProps) {
  return (
    <div style={{ display: "flex", width: "100%", alignItems: "center", borderBottom: "1px solid #1f2228", padding: "14px 16px", background: "#0c0c0b", flexShrink: 0, gap: 10 }}>
      {/* Hamburger — mobile only */}
      <button
        className="hamburger-btn md:hidden"
        onClick={onMenuClick}
        style={{ background: "none", border: "none", color: "#7d8187", cursor: "pointer", alignItems: "center", padding: 4, flexShrink: 0, transition: "color 0.15s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#7d8187")}
        aria-label="Open sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FeatherSettings style={{ width: 16, height: 16, color: "#ffffff" }} />
        <span style={{ fontSize: 16, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>
          Settings
        </span>
        <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", border: "1px solid #1f2228", borderRadius: 9999, padding: "2px 8px" }}>
          Account
        </span>
      </div>
    </div>
  );
}
