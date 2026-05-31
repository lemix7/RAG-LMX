"use client";

import { useEffect, useRef, useState } from "react";
import { FeatherAlertCircle, FeatherCheckCircle, FeatherFile, FeatherLoader } from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface StatCardsProps {
  total: number;
  ready: number;
  processing: number;
  errored: number;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentColor: string;
  index: number;
}

function useCountUp(target: number, duration = 600) {
  const [count, setCount] = useState(0);
  const prev = useRef(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setCount(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        prev.current = target;
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return count;
}

function StatCard({ label, value, icon, accentColor, index }: StatCardProps) {
  const displayed = useCountUp(value);

  return (
    <div
      className="kb-stat-card"
      style={{
        display: "flex",
        flex: 1,
        minWidth: 120,
        flexDirection: "column",
        gap: 12,
        padding: 16,
        background: "#0c0c0b",
        border: "1px solid #1f2228",
        animationDelay: `${0.08 + index * 0.06}s`,
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#474747"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#1f2228"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ color: accentColor, display: "flex", opacity: 0.7, transition: "opacity 0.2s" }}>{icon}</span>
      </div>
      <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#ffffff" }}>
        {displayed}
      </span>
    </div>
  );
}

export function StatCards({ total, ready, processing, errored }: StatCardsProps) {
  return (
    <div className="kb-animate-cards" style={{ display: "flex", width: "100%", flexWrap: "wrap", gap: 1, background: "#1f2228" }}>
      <StatCard label="Total Files"  value={total}      icon={<FeatherFile         style={{ width: 15, height: 15 }} />} accentColor="#474747" index={0} />
      <StatCard label="Ready"        value={ready}      icon={<FeatherCheckCircle  style={{ width: 15, height: 15 }} />} accentColor="#3a9a4a" index={1} />
      <StatCard label="Processing"   value={processing} icon={<FeatherLoader       style={{ width: 15, height: 15 }} />} accentColor="#2563eb" index={2} />
      <StatCard label="Error"        value={errored}    icon={<FeatherAlertCircle  style={{ width: 15, height: 15 }} />} accentColor="#f05070" index={3} />
    </div>
  );
}
