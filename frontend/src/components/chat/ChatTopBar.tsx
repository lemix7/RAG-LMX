"use client";

import { useEffect, useState } from "react";
import {
  FeatherMessageSquare,
  FeatherMoreHorizontal,
} from "@subframe/core";
import { getModel } from "@/lib/api";

export function ChatTopBar() {
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
        padding: "0 24px",
        background: "#0c0c0b",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <FeatherMessageSquare style={{ width: 16, height: 16, color: "#ffffff" }} />
        <span style={{ fontSize: 16, fontFamily: "var(--font-inter), ui-sans-serif, sans-serif", fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>
          Document Assistant
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {model && (
          <span style={{
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
          </span>
        )}
        <button style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}>
          <FeatherMoreHorizontal style={{ width: 16, height: 16 }} />
        </button>
      </div>
    </div>
  );
}
