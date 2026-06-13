"use client";

import React, { useEffect, useState } from "react";
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
  FeatherUsers,
  FeatherMessageSquare,
} from "@subframe/core";
import { createClient } from "@/lib/supabase/client";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

const C = {
  bg:      "#0c0c0b",
  surface: "#1f2228",
  border:  "#1f2228",
  muted:   "#7d8187",
  whisper: "#474747",
  white:   "#ffffff",
  blue:    "#2563eb",
  green:   "#3a9a4a",
  red:     "#f05070",
  amber:   "#c47800",
  purple:  "#7c3aed",
};

const EXT_COLORS: Record<string, string> = {
  pdf:  "#f05070",
  docx: "#2563eb",
  doc:  "#2563eb",
  csv:  "#3a9a4a",
  txt:  "#c47800",
  md:   "#7c3aed",
};

interface Stats {
  totalUsers: number;
  totalDocs: number;
  totalSize: string;
  totalConversations: number;
}

interface WeekPoint { week_label: string; count: number; }
interface RecentProfile { id: string; full_name: string | null; created_at: string; }
interface RecentConv { id: string; title: string; user_id: string; created_at: string; }
interface FileInfo { name: string; size: number; ingested: boolean; }
interface UserRow { id: string; full_name: string | null; role: string; created_at: string; email: string; }

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

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

/* ─── Stat card ───────────────────────────────────────────────────── */
function StatCard({ label, value, delta, footnote, icon, accentColor, lowerIsBetter, index }: {
  label: string; value: string; delta: number; footnote: string;
  icon: React.ReactNode; accentColor: string; lowerIsBetter?: boolean; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: "flex", flex: 1, minWidth: 180, flexDirection: "column", gap: 10, padding: "18px 20px", background: C.bg, border: `1px solid ${C.border}`, transition: "border-color 0.2s" }}
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

/* ─── Area chart (real data) ──────────────────────────────────────── */
const PERIODS = ["4w", "8w", "12w"] as const;

function areaPath(data: number[], w: number, h: number, pad = 12): string {
  if (data.length < 2) return "";
  const max = Math.max(...data, 1);
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - 2 * pad));
  const ys = data.map((v) => h - pad - (v / max) * (h - 2 * pad));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" L ");
  return `M ${pts} L ${xs[xs.length - 1]},${h - pad} L ${xs[0]},${h - pad} Z`;
}

function linePath(data: number[], w: number, h: number, pad = 12): string {
  if (data.length < 2) return "";
  const max = Math.max(...data, 1);
  const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (w - 2 * pad));
  const ys = data.map((v) => h - pad - (v / max) * (h - 2 * pad));
  return `M ${xs.map((x, i) => `${x},${ys[i]}`).join(" L ")}`;
}

function AreaChart({ convData, userData }: { convData: WeekPoint[]; userData: WeekPoint[]; }) {
  const W = 500; const H = 140; const PAD = 16;

  // Merge both series onto a shared set of labels
  const allLabels = Array.from(new Set([...convData.map(d => d.week_label), ...userData.map(d => d.week_label)])).sort();
  const convMap = Object.fromEntries(convData.map(d => [d.week_label, d.count]));
  const userMap = Object.fromEntries(userData.map(d => [d.week_label, d.count]));
  const convCounts = allLabels.map(l => convMap[l] ?? 0);
  const userCounts = allLabels.map(l => userMap[l] ?? 0);

  const isEmpty = allLabels.length < 2;

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
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - 2 * PAD)} y2={PAD + f * (H - 2 * PAD)} stroke={C.surface} strokeWidth={1} />
      ))}
      {isEmpty ? (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={11} fill={C.whisper} fontFamily={MONO}>No data yet</text>
      ) : (
        <>
          {allLabels.map((label, i) => (
            <text key={i} x={PAD + (i / (allLabels.length - 1)) * (W - 2 * PAD)} y={H - 2} textAnchor="middle" fontSize={8} fill={C.whisper} fontFamily={MONO}>{label}</text>
          ))}
          <path d={areaPath(convCounts, W, H - 12, PAD)} fill="url(#gQ)" />
          <path d={areaPath(userCounts, W, H - 12, PAD)} fill="url(#gU)" />
          <motion.path d={linePath(convCounts, W, H - 12, PAD)} fill="none" stroke={C.blue}  strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }} />
          <motion.path d={linePath(userCounts, W, H - 12, PAD)} fill="none" stroke={C.green} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.15, ease: "easeOut" }} />
        </>
      )}
    </svg>
  );
}

/* ─── Donut chart (real file data) ───────────────────────────────── */
function buildDonutSlices(files: FileInfo[]) {
  const counts: Record<string, number> = {};
  for (const f of files) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "other";
    counts[ext] = (counts[ext] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([ext, value]) => ({ label: ext.toUpperCase(), value, color: EXT_COLORS[ext] ?? C.muted }));
}

function DonutChart({ files }: { files: FileInfo[] }) {
  const data = buildDonutSlices(files);
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 52; const r = 32; const cx = 70; const cy = 70;

  if (total === 0) {
    return (
      <svg viewBox="0 0 140 140" style={{ width: 140, height: 140, flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.surface} strokeWidth={R - r} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill={C.whisper} fontFamily={MONO}>No files</text>
      </svg>
    );
  }

  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(angle); const y1 = cy + R * Math.sin(angle);
    const x2 = cx + R * Math.cos(angle + sweep); const y2 = cy + R * Math.sin(angle + sweep);
    const xi1 = cx + r * Math.cos(angle + sweep); const yi1 = cy + r * Math.sin(angle + sweep);
    const xi2 = cx + r * Math.cos(angle); const yi2 = cy + r * Math.sin(angle);
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
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={18} fontWeight={400} fill={C.white} fontFamily={FONT}>{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={7} fill={C.muted} fontFamily={MONO} letterSpacing="0.08em">TOTAL</text>
    </svg>
  );
}

/* ─── Activity feed (real data) ───────────────────────────────────── */
interface ActivityItem { icon: React.ReactNode; color: string; text: string; time: string; }

function buildActivity(profiles: RecentProfile[], convs: RecentConv[]): ActivityItem[] {
  const items: ActivityItem[] = [
    ...profiles.map((p) => ({
      icon: <FeatherUsers style={{ width: 13, height: 13 }} />,
      color: C.blue,
      text: `New user ${p.full_name || "joined"}`,
      time: timeAgo(p.created_at),
      _at: p.created_at,
    })),
    ...convs.map((c) => ({
      icon: <FeatherMessageSquare style={{ width: 13, height: 13 }} />,
      color: C.muted,
      text: `New conversation: "${c.title}"`,
      time: timeAgo(c.created_at),
      _at: c.created_at,
    })),
  ];
  return items
    .sort((a, b) => new Date((b as any)._at).getTime() - new Date((a as any)._at).getTime())
    .slice(0, 8);
}

function ActivityFeed({ profiles, convs }: { profiles: RecentProfile[]; convs: RecentConv[] }) {
  const items = buildActivity(profiles, convs);
  if (items.length === 0) {
    return (
      <div style={{ padding: "20px 0", textAlign: "center", fontSize: 12, fontFamily: MONO, letterSpacing: "0.06em", color: C.whisper }}>
        No activity yet
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((item, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: 0.3 + i * 0.05 }}
          style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.surface}` : "none" }}
        >
          <span style={{ color: item.color, marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
          <span style={{ flex: 1, fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: C.white, lineHeight: 1.4 }}>{item.text}</span>
          <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: C.whisper, whiteSpace: "nowrap", flexShrink: 0 }}>{item.time}</span>
        </motion.div>
      ))}
    </div>
  );
}

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

/* ─── Recent users table ──────────────────────────────────────────── */
const CELL: React.CSSProperties = { padding: "11px 16px", borderBottom: `1px solid ${C.surface}`, verticalAlign: "middle", fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: C.muted, whiteSpace: "nowrap" };
const TH: React.CSSProperties   = { padding: "9px 16px", textAlign: "left", fontSize: 10, fontFamily: MONO, letterSpacing: "0.1em", color: C.whisper, fontWeight: 400, borderBottom: `1px solid ${C.surface}`, textTransform: "uppercase" };

function getInitials(name: string | null, email: string) {
  if (name?.trim()) return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return email[0]?.toUpperCase() ?? "?";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("8w");
  const [stats, setStats] = useState<Stats | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [weeklyConvs, setWeeklyConvs] = useState<WeekPoint[]>([]);
  const [weeklyUsers, setWeeklyUsers] = useState<WeekPoint[]>([]);
  const [recentProfiles, setRecentProfiles] = useState<RecentProfile[]>([]);
  const [recentConvs, setRecentConvs] = useState<RecentConv[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [
        { count: userCount },
        { count: convCount },
        filesRes,
        statsRes,
        { data: profilesData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("conversations").select("*", { count: "exact", head: true }),
        fetch("/api/files", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ files: [] })),
        fetch("/api/admin/stats").then((r) => r.json()).catch(() => ({})),
        supabase.from("profiles").select("id, full_name, role, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      const fileList: FileInfo[] = filesRes.files ?? [];
      const totalSize = fileList.reduce((acc, f) => acc + f.size, 0);

      setFiles(fileList);
      setStats({
        totalUsers: userCount ?? 0,
        totalDocs: fileList.length,
        totalSize: formatBytes(totalSize),
        totalConversations: convCount ?? 0,
      });

      if (statsRes.weeklyConversations) setWeeklyConvs(statsRes.weeklyConversations);
      if (statsRes.weeklyUsers)         setWeeklyUsers(statsRes.weeklyUsers);
      if (statsRes.recentProfiles)      setRecentProfiles(statsRes.recentProfiles);
      if (statsRes.recentConversations) setRecentConvs(statsRes.recentConversations);

      const emailRes = await fetch("/api/admin/users").catch(() => null);
      const emailMap: Record<string, string> = {};
      if (emailRes?.ok) {
        const json = await emailRes.json();
        for (const u of json.users ?? []) emailMap[u.id] = u.email;
      }
      setRecentUsers((profilesData ?? []).map((p) => ({ ...p, email: emailMap[p.id] ?? "" })));
    }
    load();
  }, []);

  const display = (val: number | string | undefined) => stats === null ? "—" : String(val);

  // Filter chart data by selected period
  const periodWeeks = period === "4w" ? 4 : period === "8w" ? 8 : 12;
  const convSlice = weeklyConvs.slice(-periodWeeks);
  const userSlice = weeklyUsers.slice(-periodWeeks);

  // Compute delta vs prior period for stat cards
  const convDelta = (() => {
    if (weeklyConvs.length < 2) return 0;
    const half = Math.ceil(weeklyConvs.length / 2);
    const recent = weeklyConvs.slice(-half).reduce((s, d) => s + d.count, 0);
    const prior  = weeklyConvs.slice(0, -half).reduce((s, d) => s + d.count, 0);
    if (prior === 0) return 0;
    return ((recent - prior) / prior) * 100;
  })();

  const userDelta = (() => {
    if (weeklyUsers.length < 2) return 0;
    const half = Math.ceil(weeklyUsers.length / 2);
    const recent = weeklyUsers.slice(-half).reduce((s, d) => s + d.count, 0);
    const prior  = weeklyUsers.slice(0, -half).reduce((s, d) => s + d.count, 0);
    if (prior === 0) return 0;
    return ((recent - prior) / prior) * 100;
  })();

  const donutData = buildDonutSlices(files);

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "40px 40px 48px" }} className="admin-body">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: C.white, lineHeight: 1.2 }}>Admin Dashboard</span>
          <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: C.muted, lineHeight: 1.5 }}>Overview of your RAG chatbot platform</span>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: C.surface }}>
          <StatCard label="Total Users"     value={display(stats?.totalUsers)}        delta={userDelta} footnote="vs prior period" icon={<FeatherUsers         style={{ width: 15, height: 15 }} />} accentColor={C.blue}  index={0} />
          <StatCard label="Total Documents" value={display(stats?.totalDocs)}          delta={0}         footnote="files uploaded"   icon={<FeatherFileText      style={{ width: 15, height: 15 }} />} accentColor={C.green} index={1} />
          <StatCard label="Storage Used"    value={display(stats?.totalSize)}          delta={0}         footnote="across all files"  icon={<FeatherHardDrive     style={{ width: 15, height: 15 }} />} accentColor={C.amber} index={2} />
          <StatCard label="Conversations"   value={display(stats?.totalConversations)} delta={convDelta} footnote="vs prior period" icon={<FeatherMessageCircle style={{ width: 15, height: 15 }} />} accentColor={C.muted} index={3} />
        </div>

        {/* Charts row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ flex: "2 1 360px" }}>
            <Card>
              <CardHeader title="Usage Over Time" action={
                <div style={{ display: "flex", gap: 4 }}>
                  {PERIODS.map((p) => (
                    <button key={p} onClick={() => setPeriod(p)} style={{ padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", background: period === p ? C.surface : "transparent", border: `1px solid ${period === p ? C.whisper : "transparent"}`, color: period === p ? C.white : C.muted, cursor: "pointer", transition: "all 0.15s" }}>{p}</button>
                  ))}
                </div>
              } />
              <div style={{ padding: "16px 20px 8px" }}>
                <AreaChart convData={convSlice} userData={userSlice} />
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  {[{ color: C.blue, label: "Conversations" }, { color: C.green, label: "New Users" }].map((l) => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 20, height: 2, background: l.color, display: "inline-block", borderRadius: 1 }} />
                      <span style={{ fontSize: 10, fontFamily: MONO, letterSpacing: "0.08em", color: C.muted }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }} style={{ flex: "1 1 220px" }}>
            <Card style={{ height: "100%" }}>
              <CardHeader title="Uploads by Type" />
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                <DonutChart files={files} />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {donutData.length === 0 ? (
                    <span style={{ fontSize: 11, fontFamily: MONO, color: C.whisper }}>No files yet</span>
                  ) : donutData.map((d) => {
                    const pct = files.length > 0 ? Math.round((d.value / files.length) * 100) : 0;
                    return (
                      <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: C.muted }}>{d.label}</span>
                        <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: C.white, marginLeft: "auto" }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Activity feed — real data */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}>
          <Card>
            <CardHeader title="Recent Activity" />
            <div style={{ padding: "4px 20px 8px" }}>
              <ActivityFeed profiles={recentProfiles} convs={recentConvs} />
            </div>
          </Card>
        </motion.div>

        {/* Recent Users table — real data */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.32 }}>
          <Card>
            <CardHeader title="Recent Users" action={
              <Link href="/admin/users" style={{ display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none", fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: C.muted, transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.white)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}
              >
                View all <FeatherArrowRight style={{ width: 11, height: 11 }} />
              </Link>
            } />
            <div style={{ width: "100%", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Name", "Email", "Role", "Joined"].map((h) => (
                      <th key={h} style={TH}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.length === 0 ? (
                    <tr><td colSpan={4} style={{ ...CELL, textAlign: "center", color: C.whisper, fontFamily: MONO, fontSize: 12 }}>
                      {stats === null ? "Loading…" : "No users yet"}
                    </td></tr>
                  ) : recentUsers.map((user, i) => (
                    <motion.tr key={user.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: 0.35 + i * 0.04 }}
                      style={{ transition: "background 0.12s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.surface)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={CELL}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar size="small">{getInitials(user.full_name, user.email)}</Avatar>
                          <span style={{ color: C.white, fontWeight: 500 }}>{user.full_name || "—"}</span>
                        </div>
                      </td>
                      <td style={CELL}>{user.email || "—"}</td>
                      <td style={CELL}><Badge variant={user.role === "admin" ? "brand" : "neutral"}>{user.role}</Badge></td>
                      <td style={{ ...CELL, fontFamily: MONO, fontSize: 11, letterSpacing: "0.06em", color: C.whisper }}>{formatDate(user.created_at)}</td>
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
