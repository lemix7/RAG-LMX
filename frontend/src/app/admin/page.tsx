"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { BarChart } from "@/ui/components/BarChart";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { LineChart } from "@/ui/components/LineChart";
import { Table } from "@/ui/components/Table";
import {
  FeatherArrowRight,
  FeatherArrowUp,
  FeatherChevronDown,
  FeatherEdit2,
  FeatherFileText,
  FeatherHardDrive,
  FeatherMessageCircle,
  FeatherMoreHorizontal,
  FeatherTrash,
  FeatherUser,
  FeatherUsers,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

/* ─── Stat Card ───────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string;
  trend: string;
  trendColor: string;
  icon: React.ReactNode;
  iconVariant: "brand" | "success" | "warning" | "neutral" | "error";
}

function StatCard({ label, value, trend, trendColor, icon, iconVariant }: StatCardProps) {
  return (
    <div style={{
      display: "flex",
      flex: 1,
      minWidth: 192,
      flexDirection: "column",
      gap: 12,
      borderRadius: 8,
      border: "1px solid #1f2228",
      background: "#0c0c0b",
      padding: "20px 24px",
    }}>
      <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 15, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>{label}</span>
        <IconWithBackground variant={iconVariant} size="medium" icon={icon} />
      </div>
      <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff", lineHeight: 1 }}>{value}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <FeatherArrowUp style={{ width: 12, height: 12, color: trendColor }} />
        <span style={{ fontSize: 12, fontFamily: FONT, letterSpacing: "-0.025em", color: trendColor }}>{trend}</span>
        <span style={{ fontSize: 12, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>from last month</span>
      </div>
    </div>
  );
}

/* ─── User data ───────────────────────────────────────────────────── */

interface UserRowData {
  name: string;
  email: string;
  role: string;
  roleVariant: "brand" | "neutral" | "warning" | "success" | "error";
  lastActive: string;
  status: "Active" | "Offline";
  avatar?: string;
  initials: string;
}

const USERS: UserRowData[] = [
  { name: "Alex Thompson",   email: "alex.thompson@company.com",   role: "Admin",  roleVariant: "brand",   lastActive: "2 min ago",   status: "Active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417514/shared/ubsk7cs5hnnaj798efej.jpg",  initials: "A" },
  { name: "Sarah Mitchell",  email: "sarah.mitchell@company.com",  role: "Editor", roleVariant: "neutral", lastActive: "15 min ago",  status: "Active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg",  initials: "S" },
  { name: "James Rodriguez", email: "james.rodriguez@company.com", role: "Viewer", roleVariant: "neutral", lastActive: "1 hour ago",  status: "Active",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/m0kfajqpwkfief00it4v.jpg",  initials: "J" },
  { name: "Emily Chen",      email: "emily.chen@company.com",      role: "Editor", roleVariant: "warning", lastActive: "3 hours ago", status: "Offline", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/btvntvzhdbhpulae3kzk.jpg",  initials: "E" },
  { name: "Michael Park",    email: "michael.park@company.com",    role: "Admin",  roleVariant: "brand",   lastActive: "1 day ago",   status: "Offline", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif", initials: "M" },
];

/* ─── Chart data ──────────────────────────────────────────────────── */

const LINE_DATA = [
  { Week: "Week 1", Queries: 2400, "Documents Uploaded": 180, "Active Users": 620 },
  { Week: "Week 2", Queries: 2800, "Documents Uploaded": 210, "Active Users": 680 },
  { Week: "Week 3", Queries: 3100, "Documents Uploaded": 250, "Active Users": 720 },
  { Week: "Week 4", Queries: 2900, "Documents Uploaded": 230, "Active Users": 710 },
  { Week: "Week 5", Queries: 3400, "Documents Uploaded": 290, "Active Users": 780 },
  { Week: "Week 6", Queries: 3800, "Documents Uploaded": 310, "Active Users": 850 },
  { Week: "Week 7", Queries: 4200, "Documents Uploaded": 340, "Active Users": 920 },
  { Week: "Week 8", Queries: 4500, "Documents Uploaded": 380, "Active Users": 960 },
];

const BAR_DATA = [
  { Month: "Jun", PDF: 320, DOCX: 180, TXT: 90, CSV: 60 },
  { Month: "Jul", PDF: 380, DOCX: 210, TXT: 110, CSV: 75 },
  { Month: "Aug", PDF: 420, DOCX: 240, TXT: 130, CSV: 85 },
  { Month: "Sep", PDF: 460, DOCX: 260, TXT: 140, CSV: 95 },
  { Month: "Oct", PDF: 510, DOCX: 290, TXT: 160, CSV: 110 },
  { Month: "Nov", PDF: 540, DOCX: 310, TXT: 170, CSV: 120 },
];

/* ─── Page ────────────────────────────────────────────────────────── */

export default function AdminPage() {
  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "40px 40px 48px" }} className="admin-body">

        {/* Page header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff", lineHeight: 1.2 }}>
            Admin Dashboard
          </span>
          <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187", lineHeight: 1.5 }}>
            Overview of your RAG chatbot platform
          </span>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          <StatCard label="Total Users"      value="1,284" trend="12.5%" trendColor="#3a9a4a" icon={<FeatherUsers />}         iconVariant="brand"   />
          <StatCard label="Total Documents"  value="8,432" trend="8.2%"  trendColor="#3a9a4a" icon={<FeatherFileText />}      iconVariant="success" />
          <StatCard label="Storage Used"     value="246 GB" trend="18.3%" trendColor="#c47800" icon={<FeatherHardDrive />}     iconVariant="warning" />
          <StatCard label="Active Chats"     value="342"   trend="5.1%"  trendColor="#3a9a4a" icon={<FeatherMessageCircle />} iconVariant="neutral" />
        </div>

        {/* Charts row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: "1 1 384px", display: "flex", flexDirection: "column", gap: 16, borderRadius: 8, border: "1px solid #1f2228", background: "#0c0c0b", padding: 24 }}>
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Usage Over Time</span>
              <Button variant="neutral-secondary" size="small" iconRight={<FeatherChevronDown />} onClick={() => {}}>Last 30 days</Button>
            </div>
            <LineChart className="h-64 w-full flex-none" categories={["Queries", "Documents Uploaded", "Active Users"]} data={LINE_DATA} index="Week" />
          </div>

          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: 16, borderRadius: 8, border: "1px solid #1f2228", background: "#0c0c0b", padding: 24 }}>
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Uploads by Type</span>
              <Button variant="neutral-secondary" size="small" iconRight={<FeatherChevronDown />} onClick={() => {}}>This month</Button>
            </div>
            <BarChart className="h-64 w-full flex-none" categories={["PDF", "DOCX", "TXT", "CSV"]} data={BAR_DATA} index="Month" />
          </div>
        </div>

        {/* Users table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, borderRadius: 8, border: "1px solid #1f2228", background: "#0c0c0b", padding: 24 }}>
          <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Recent Users</span>
            <Link href="/admin/users" style={{ textDecoration: "none" }}>
              <Button variant="neutral-tertiary" iconRight={<FeatherArrowRight />} onClick={() => {}}>View all</Button>
            </Link>
          </div>

          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table header={
              <Table.HeaderRow>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Last Active</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.HeaderRow>
            }>
              {USERS.map((user) => (
                <Table.Row key={user.email}>
                  <Table.Cell>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar size="small" image={user.avatar}>{user.initials}</Avatar>
                      <span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, fontWeight: 500, letterSpacing: "-0.025em", color: "#ffffff" }}>{user.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>{user.email}</span></Table.Cell>
                  <Table.Cell><Badge variant={user.roleVariant}>{user.role}</Badge></Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>{user.lastActive}</span></Table.Cell>
                  <Table.Cell><Badge variant={user.status === "Active" ? "success" : "neutral"}>{user.status}</Badge></Table.Cell>
                  <Table.Cell>
                    <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "flex-end" }}>
                      <SubframeCore.DropdownMenu.Root>
                        <SubframeCore.DropdownMenu.Trigger asChild>
                          <IconButton icon={<FeatherMoreHorizontal />} onClick={() => {}} />
                        </SubframeCore.DropdownMenu.Trigger>
                        <SubframeCore.DropdownMenu.Portal>
                          <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild>
                            <DropdownMenu>
                              <DropdownMenu.DropdownItem icon={<FeatherUser />}>View Profile</DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>Edit</DropdownMenu.DropdownItem>
                              <DropdownMenu.DropdownItem icon={<FeatherTrash />}>Remove</DropdownMenu.DropdownItem>
                            </DropdownMenu>
                          </SubframeCore.DropdownMenu.Content>
                        </SubframeCore.DropdownMenu.Portal>
                      </SubframeCore.DropdownMenu.Root>
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}
