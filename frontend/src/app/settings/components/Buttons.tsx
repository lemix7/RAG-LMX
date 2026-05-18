import React from "react";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

export function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
      {children}
    </div>
  );
}

export function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button
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
        cursor: "pointer",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {children}
    </button>
  );
}

export function FilledButton({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <button
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
        cursor: "pointer",
        transition: "opacity 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {icon}
      {children}
    </button>
  );
}
