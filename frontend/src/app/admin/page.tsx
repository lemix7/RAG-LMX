"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import {
  FeatherArrowDownRight,
  FeatherArrowRight,
  FeatherArrowUpRight,
  FeatherFileText,
  FeatherHardDrive,
  FeatherMessageCircle,
  FeatherShield,
  FeatherUsers,
  FeatherZap,
  FeatherLayers,
  FeatherCheckCircle,
  FeatherAlertCircle,
} from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

/* ─── Palette ─────────────────────────────────────────────────────── */
const C = {
  bg:       "#0c0c0b",
  surface:  "#1f2228",
  border:   "#1f2228",
  muted:    "#7d8187",
  whisper:  "#474747",
  white:    "#ffffff",
  blue:     "#2563eb",
  blueDim:  "#1a3568",
  green:    "#3a9a4a",
  red:      "#f05070",
  amber:    "#c47800",
};

/* ─── Delta chip ──────────────────────────────────────────────────── */
function Delta({ value, lowerIsBetter = false }: { value: number; lowerIsBetter?: boolean }) {
  const positive = lowerIsBetter ? value < 0 : value > 0;
  const color = positive ? C.green : C.red;
  const Icon = value >= 0 ? FeatherArrowUpRight : FeatherArrowDownRight;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color }}>
      <Icon style={{ width: 11, height: 11 }} />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

/* ─── Stat cards ──────────────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string;
  delta: number;
  footnote: string;
  icon: React.ReactNode;
  accentColor: string;
  lowerIsBetter?: boolean;
  index: number;
}

function StatCard({ label, value, delta, footnote, icon, accentColor, lowerIsBetter, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex", flex: 1, minWidth: 180, flexDirection: "column", gap: 10,
        padding: "18px 20px", background: C.bg, border: `1px solid ${C.border}`,
        transition: "border-color 0.2s",
      }}
      whileHover={{ borderColor: C.whisper }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: C.muted, textTransform: "uppercase" }}>{label}</span>
        <span style={{ color: accentColor, opacity: 0.7, display: "flex" }}>{icon}</span>
      </div>
      <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: C.white, lineHeight: 1 }}>{value}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Delta value={delta} lowerIsBetter={lowerIsBetter} />
        <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: C.whisper }}>{footnote}</span>
      </div>
    </motion.div>
  );
}

/* ─── Area chart (SVG) ────────────────────────────────────────────── */
const AREA_DATA = [
  { label: "W1",  queries: 2400, docs: 180, users: 620  },
  { label: "W2",  queries: 2800, docs: 210, users: 680  },
  { label: "W3",  queries: 3100, docs: 250, users: 720  },
  { label: "W4",  queries: 2900, docs: 230, users: 710  },
  { label: "W5",  queries: 3400, docs: 290, users: 780  },
  { label: "W6",  queries: 3800, docs: 310, users: 850  },
  { label: "W7",  queries: 4200, docs: 340, users: 920  },
  { label: "W8",  queries: 4500, docs: 380, users: 960  },
];

const PERIODS = ["4w", "8w", "12w"] as const;

function areaPath(data: number[], w: number, h: number, pad = 12): string {
  const max = Math.max(...data);
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - 2 * pad));
  const ys = data.map((v) => h - pad - (v / max) * (h - 2 * pad));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" L ");
  return `M ${pts} L ${xs[xs.length - 1]},${h - pad} L ${xs[0]},${h - pad} Z`;
}

function linePath(data: number[], w: number, h: number, pad = 12): string {
  const max = Math.max(...data);
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - 2 * pad));
  const ys = data.map((v) => h - pad - (v / max) * (h - 2 * pad));
  return `M ${xs.map((x, i) => `${x},${ys[i]}`).join(" L ")}`;
}

function AreaChart() {
  const W = 500; const H = 140; const PAD = 16;
  const queries = AREA_DATA.map((d) => d.queries);
  const users   = AREA_DATA.map((d) => d.users);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 140, overflow: "visible" }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.blue} stopOpacity="0.25" />
          <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.green} stopOpacity="0.18" />
          <stop offset="100%" stopColor={C.green} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - 2 * PAD)} y2={PAD + f * (H - 2 * PAD)}
          stroke={C.surface} strokeWidth={1} />
      ))}
      {/* X labels */}
      {AREA_DATA.map((d, i) => (
        <text key={i}
          x={PAD + (i / (AREA_DATA.length - 1)) * (W - 2 * PAD)}
          y={H - 2}
          textAnchor="middle" fontSize={8} fill={C.whisper} fontFamily={MONO}>
          {d.label}
        </text>
      ))}
      {/* Areas */}
      <path d={areaPath(queries, W, H - 12, PAD)} fill="url(#gQ)" />
      <path d={areaPath(users,   W, H - 12, PAD)} fill="url(#gU)" />
      {/* Lines */}
      <motion.path
        d={linePath(queries, W, H - 12, PAD)} fill="none" stroke={C.blue} strokeWidth={1.5}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.path
        d={linePath(users, W, H - 12, PAD)} fill="none" stroke={C.green} strokeWidth={1.5}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ─── Donut chart (SVG) ───────────────────────────────────────────── */
const DONUT_DATA = [
  { label: "PDF",  value: 44, color: C.red   },
  { label: "DOCX", value: 28, color: C.blue  },
  { label: "CSV",  value: 16, color: C.green },
  { label: "TXT",  value: 12, color: C.amber },
];

function DonutChart() {
  const R = 52; const r = 32; const cx = 70; const cy = 70;
  let angle = -Math.PI / 2;
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0);

  const slices = DONUT_DATA.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle);
    const y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(angle + sweep);
    const y2 = cy + R * Math.sin(angle + sweep);
    const xi1 = cx + r * Math.cos(angle + sweep);
    const yi1 = cy + r * Math.sin(angle + sweep);
    const xi2 = cx + r * Math.cos(angle);
    const yi2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${r} ${r} 0 ${large} 0 ${xi2} ${yi2} Z`;
    angle += sweep;
    return { ...d, path };
  });

  return (
    <svg viewBox="0 0 140 140" style={{ width: 140, height: 140, flexShrink: 0 }}>
      {slices.map((s, i) => (
        <motion.path key={i} d={s.path} fill={s.color} opacity={0.85}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={400} fill={C.white} fontFamily={FONT}>{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={7} fill={C.muted} fontFamily={MONO} letterSpacing="0.08em">TOTAL</text>
    </svg>
  );
}

/* ─── Activity feed ───────────────────────────────────────────────── */
const ACTIVITY = [
  { icon: <FeatherCheckCircle style={{ width: 13, height: 13 }} />, color: C.green, text: "Q4-2024-Report.pdf ingested successfully", time: "2 min ago" },
  { icon: <FeatherUsers       style={{ width: 13, height: 13 }} />, color: C.blue,  text: "New user Nina Patel joined",               time: "18 min ago" },
  { icon: <FeatherAlertCircle style={{ width: 13, height: 13 }} />, color: C.red,   text: "Legal-Terms-2024.pdf ingestion failed",    time: "1 hr ago" },
  { icon: <FeatherShield      style={{ width: 13, height: 13 }} />, color: C.amber, text: "Admin role granted to Alex Thompson",      time: "3 hr ago" },
  { icon: <FeatherZap         style={{ width: 13, height: 13 }} />, color: C.muted, text: "System reindex completed — 540 chunks",    time: "Yesterday" },
  { icon: <FeatherLayers      style={{ width: 13, height: 13 }} />, color: C.muted, text: "Engineering-Spec-v3.pdf queued",           time: "Yesterday" },
];

function ActivityFeed() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {ACTIVITY.map((item, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.3 + i * 0.05 }}
          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.surface}` : "none" }}
        >
          <span style={{ color: item.color, marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
          <span style={{ flex: 1, fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: C.white, lineHeight: 1.4 }}>{item.text}</span>
          <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: C.whisper, whiteSpace: "nowrap", flexShrink: 0 }}>{item.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Team on duty ────────────────────────────────────────────────── */
const TEAM = [
  { name: "Alex Thompson",   role: "Admin",  status: "active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417514/shared/ubsk7cs5hnnaj798efej.jpg",  initials: "AT" },
  { name: "Sarah Mitchell",  role: "Editor", status: "active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg",  initials: "SM" },
  { name: "Lucas Fernandez", role: "Editor", status: "active",  initials: "LF" },
  { name: "Nina Patel",      role: "Viewer", status: "active",  initials: "NP" },
  { name: "Emily Chen",      role: "Editor", status: "offline", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/btvntvzhdbhpulae3kzk.jpg",  initials: "EC" },
  { name: "Michael Park",    role: "Admin",  status: "offline", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif", initials: "MP" },
];

function TeamOnDuty() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {TEAM.map((member, i) => (
        <motion.div key={member.name}
          initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.3 + i * 0.05 }}
          style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < TEAM.length - 1 ? `1px solid ${C.surface}` : "none" }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Avatar size="small" image={member.avatar}>{member.initials}</Avatar>
            <span style={{
              position: "absolute", bottom: 0, right: 0,
              width: 7, height: 7, borderRadius: "50%",
              background: member.status === "active" ? C.green : C.whisper,
              border: `1.5px solid ${C.bg}`,
            }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</div>
            <div style={{ fontSize: 10, fontFamily: MONO, letterSpacing: "0.08em", color: C.muted }}>{member.role}</div>
          </div>
          <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: "0.06em", color: member.status === "active" ? C.green : C.whisper }}>
            {member.status === "active" ? "Online" : "Offline"}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Recent conversations table ──────────────────────────────────── */
const RECENT_USERS = [
  { name: "Alex Thompson",   email: "alex.thompson@company.com",   role: "Admin",  roleVariant: "brand"   as const, status: "Active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417514/shared/ubsk7cs5hnnaj798efej.jpg",  initials: "AT" },
  { name: "Sarah Mitchell",  email: "sarah.mitchell@company.com",  role: "Editor", roleVariant: "neutral" as const, status: "Active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg",  initials: "SM" },
  { name: "James Rodriguez", email: "james.rodriguez@company.com", role: "Viewer", roleVariant: "neutral" as const, status: "Active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/m0kfajqpwkfief00it4v.jpg",  initials: "JR" },
  { name: "Emily Chen",      email: "emily.chen@company.com",      role: "Editor", roleVariant: "warning" as const, status: "Offline", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/btvntvzhdbhpulae3kzk.jpg",  initials: "EC" },
  { name: "Michael Park",    email: "michael.park@company.com",    role: "Admin",  roleVariant: "brand"   as const, status: "Offline", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif", initials: "MP" },
];

const CELL: React.CSSProperties = {
  padding: "11px 16px", borderBottom: `1px solid ${C.surface}`, verticalAlign: "middle",
  fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: C.muted, whiteSpace: "nowrap",
};
const TH: React.CSSProperties = {
  padding: "9px 16px", textAlign: "left", fontSize: 10, fontFamily: MONO, letterSpacing: "0.1em",
  color: C.whisper, fontWeight: 400, borderBottom: `1px solid ${C.surface}`, textTransform: "uppercase",
};

/* ─── Card wrapper ────────────────────────────────────────────────── */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${C.border}`, background: C.bg, ...style }}>
      {children}
    </div>
  );
}
function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${C.surface}` }}>
      <span style={{ fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: C.white }}>{title}</span>
      {action}
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("8w");

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "40px 40px 48px" }} className="admin-body">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: C.white, lineHeight: 1.2 }}>
            Admin Dashboard
          </span>
          <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: C.muted, lineHeight: 1.5 }}>
            Overview of your RAG chatbot platform
          </span>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: C.surface }}>
          <StatCard label="Total Users"     value="1,284" delta={12.5}  footnote="vs last month" icon={<FeatherUsers        style={{ width: 15, height: 15 }} />} accentColor={C.blue}  index={0} />
          <StatCard label="Total Documents" value="8,432" delta={8.2}   footnote="vs last month" icon={<FeatherFileText    style={{ width: 15, height: 15 }} />} accentColor={C.green} index={1} />
          <StatCard label="Storage Used"    value="246 GB" delta={18.3}  footnote="vs last month" icon={<FeatherHardDrive   style={{ width: 15, height: 15 }} />} accentColor={C.amber} index={2} lowerIsBetter />
          <StatCard label="Active Chats"    value="342"   delta={5.1}   footnote="vs last month" icon={<FeatherMessageCircle style={{ width: 15, height: 15 }} />} accentColor={C.muted} index={3} />
        </div>

        {/* Charts row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>

          {/* Usage over time — area chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            style={{ flex: "2 1 360px" }}>
            <Card>
              <CardHeader
                title="Usage Over Time"
                action={
                  <div style={{ display: "flex", gap: 4 }}>
                    {PERIODS.map((p) => (
                      <button key={p} onClick={() => setPeriod(p)} style={{
                        padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em",
                        background: period === p ? C.surface : "transparent",
                        border: `1px solid ${period === p ? C.whisper : "transparent"}`,
                        color: period === p ? C.white : C.muted, cursor: "pointer", transition: "all 0.15s",
                      }}>{p}</button>
                    ))}
                  </div>
                }
              />
              <div style={{ padding: "16px 20px 8px" }}>
                <AreaChart />
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  {[{ color: C.blue, label: "Queries" }, { color: C.green, label: "Active Users" }].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 20, height: 2, background: l.color, display: "inline-block", borderRadius: 1 }} />
                      <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: "0.08em", color: C.muted }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Upload breakdown — donut chart */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}
            style={{ flex: "1 1 220px" }}>
            <Card style={{ height: "100%" }}>
              <CardHeader title="Uploads by Type" />
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                <DonutChart />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {DONUT_DATA.map((d) => (
                    <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: C.muted }}>{d.label}</span>
                      <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: C.white, marginLeft: "auto" }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Bottom row: activity + team */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>

          {/* Activity feed */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}
            style={{ flex: "2 1 360px" }}>
            <Card>
              <CardHeader title="Recent Activity" />
              <div style={{ padding: "4px 20px 8px" }}>
                <ActivityFeed />
              </div>
            </Card>
          </motion.div>

          {/* Team on duty */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.28 }}
            style={{ flex: "1 1 220px" }}>
            <Card>
              <CardHeader
                title="Team"
                action={
                  <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: "0.08em", color: C.green }}>
                    {TEAM.filter((m) => m.status === "active").length} online
                  </span>
                }
              />
              <div style={{ padding: "4px 20px 8px" }}>
                <TeamOnDuty />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Users table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.32 }}>
          <Card>
            <CardHeader
              title="Recent Users"
              action={
                <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: C.muted, transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = C.white)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
                >
                  View all <FeatherArrowRight style={{ width: 11, height: 11 }} />
                </Link>
              }
            />
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Email", "Role", "Last Active", "Status"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RECENT_USERS.map((user, i) => (
                    <motion.tr key={user.email}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.35 + i * 0.04 }}
                      style={{ transition: "background 0.12s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surface)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={CELL}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar size="small" image={user.avatar}>{user.initials}</Avatar>
                          <span style={{ color: C.white, fontWeight: 500 }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={CELL}>{user.email}</td>
                      <td style={CELL}><Badge variant={user.roleVariant}>{user.role}</Badge></td>
                      <td style={{ ...CELL, fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", color: C.whisper }}>
                        {["2 min ago", "15 min ago", "1 hour ago", "3 hours ago", "1 day ago"][i]}
                      </td>
                      <td style={CELL}>
                        <Badge variant={user.status === "Active" ? "success" : "neutral"}>{user.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
