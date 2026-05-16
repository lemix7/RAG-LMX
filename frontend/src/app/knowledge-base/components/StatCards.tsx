import {
  FeatherAlertCircle,
  FeatherCheckCircle,
  FeatherFile,
  FeatherLoader,
} from "@subframe/core";

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
  iconColor: string;
  borderColor: string;
}

function StatCard({ label, value, icon, iconColor, borderColor }: StatCardProps) {
  return (
    <div style={{
      display: "flex",
      flex: 1,
      minWidth: 120,
      flexDirection: "column",
      gap: 10,
      padding: "16px",
      background: "#0c0c0b",
      border: `1px solid ${borderColor}`,
      borderRadius: 0,
    }}>
      <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: "#7d8187", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1, color: "#ffffff" }}>
          {value}
        </span>
        <span style={{ color: iconColor, display: "flex" }}>{icon}</span>
      </div>
    </div>
  );
}

export function StatCards({ total, ready, processing, errored }: StatCardsProps) {
  return (
    <div style={{ display: "flex", width: "100%", flexWrap: "wrap", gap: 1, background: "#1f2228" }}>
      <StatCard label="Total Files" value={total} icon={<FeatherFile style={{ width: 16, height: 16 }} />} iconColor="#474747" borderColor="#1f2228" />
      <StatCard label="Ready" value={ready} icon={<FeatherCheckCircle style={{ width: 16, height: 16 }} />} iconColor="#3a9a4a" borderColor="#1f2228" />
      <StatCard label="Processing" value={processing} icon={<FeatherLoader style={{ width: 16, height: 16 }} />} iconColor="#2563eb" borderColor="#1f2228" />
      <StatCard label="Error" value={errored} icon={<FeatherAlertCircle style={{ width: 16, height: 16 }} />} iconColor="#f05070" borderColor="#1f2228" />
    </div>
  );
}
