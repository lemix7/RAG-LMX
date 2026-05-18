import React from "react";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, border: "1px solid #1f2228", padding: 24, background: "#0c0c0b" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 16, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>{title}</span>
        <span style={{ fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187", lineHeight: 1.43 }}>{description}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}
