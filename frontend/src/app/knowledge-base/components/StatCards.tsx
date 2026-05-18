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
}

function StatCard({ label, value, icon, accentColor }: StatCardProps) {
  return (
    <div style={{
      display: "flex",
      flex: 1,
      minWidth: 120,
      flexDirection: "column",
      gap: 12,
      padding: 16,
      background: "#0c0c0b",
      border: "1px solid #1f2228",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ color: accentColor, display: "flex", opacity: 0.7 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#ffffff" }}>
        {value}
      </span>
    </div>
  );
}

export function StatCards({ total, ready, processing, errored }: StatCardsProps) {
  return (
    <div style={{ display: "flex", width: "100%", flexWrap: "wrap", gap: 1, background: "#1f2228" }}>
      <StatCard label="Total Files"  value={total}      icon={<FeatherFile         style={{ width: 15, height: 15 }} />} accentColor="#474747" />
      <StatCard label="Ready"        value={ready}      icon={<FeatherCheckCircle  style={{ width: 15, height: 15 }} />} accentColor="#3a9a4a" />
      <StatCard label="Processing"   value={processing} icon={<FeatherLoader       style={{ width: 15, height: 15 }} />} accentColor="#2563eb" />
      <StatCard label="Error"        value={errored}    icon={<FeatherAlertCircle  style={{ width: 15, height: 15 }} />} accentColor="#f05070" />
    </div>
  );
}
