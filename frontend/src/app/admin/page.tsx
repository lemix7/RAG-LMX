"use client";

import React, { useState } from "react";
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
  FeatherActivity,
  FeatherArrowRight,
  FeatherArrowUp,
  FeatherBarChart2,
  FeatherBookOpen,
  FeatherBot,
  FeatherChevronDown,
  FeatherDatabase,
  FeatherDownload,
  FeatherEdit2,
  FeatherFileText,
  FeatherHardDrive,
  FeatherLayers,
  FeatherMenu,
  FeatherMessageCircle,
  FeatherMessageSquare,
  FeatherMoreHorizontal,
  FeatherPlus,
  FeatherSettings,
  FeatherShield,
  FeatherTrash,
  FeatherUser,
  FeatherUsers,
  FeatherX,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

/* ─── Sidebar ─────────────────────────────────────────────────────── */

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  href?: string;
}

function NavItem({ icon, label, selected, href }: NavItemProps) {
  const content = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        background: selected ? "#1f2228" : "transparent",
        color: selected ? "#ffffff" : "#a0a4ab",
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s",
        fontSize: 15,
        fontFamily: FONT,
        letterSpacing: "-0.025em",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          e.currentTarget.style.background = "#1f2228";
          e.currentTarget.style.color = "#ffffff";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#a0a4ab";
        }
      }}
    >
      <span style={{ width: 15, height: 15, display: "flex", alignItems: "center", flexShrink: 0 }}>
        {icon}
      </span>
      {label}
    </div>
  );
  if (href) return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  return content;
}

interface NavSectionProps {
  label: string;
  children: React.ReactNode;
}

function NavSection({ label, children }: NavSectionProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em", color: "#474747", textTransform: "uppercase", padding: "8px 12px 4px" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

interface AdminSidebarProps {
  onClose?: () => void;
}

function AdminSidebar({ onClose }: AdminSidebarProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: 280,
      height: "100%",
      background: "#0c0c0b",
      borderRight: "1px solid #1f2228",
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "20px 16px 16px", borderBottom: "1px solid #1f2228" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a3568", border: "1px solid #2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FeatherLayers style={{ width: 15, height: 15, color: "#ffffff" }} />
          </div>
          <span style={{ fontSize: 15, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff" }}>RAG LMX</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#7d8187", cursor: "pointer", display: "flex", alignItems: "center", padding: 4, borderRadius: 4, transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#7d8187")}
            aria-label="Close sidebar"
          >
            <FeatherX style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "12px 8px", flex: 1, overflowY: "auto" }}>
        <NavItem icon={<FeatherMessageSquare style={{ width: 15, height: 15 }} />} label="Chat" href="/" />
        <NavItem icon={<FeatherBookOpen style={{ width: 15, height: 15 }} />} label="Knowledge Base" href="/knowledge-base" />
        <NavItem icon={<FeatherShield style={{ width: 15, height: 15 }} />} label="Admin" selected href="/admin" />
        <NavItem icon={<FeatherSettings style={{ width: 15, height: 15 }} />} label="Settings" href="/settings" />

        <div style={{ marginTop: 8 }}>
          <NavSection label="Management">
            <NavItem icon={<FeatherUsers style={{ width: 15, height: 15 }} />} label="Users" />
            <NavItem icon={<FeatherFileText style={{ width: 15, height: 15 }} />} label="Documents" />
            <NavItem icon={<FeatherDatabase style={{ width: 15, height: 15 }} />} label="Storage" />
          </NavSection>
        </div>

        <div style={{ marginTop: 8 }}>
          <NavSection label="Analytics">
            <NavItem icon={<FeatherBarChart2 style={{ width: 15, height: 15 }} />} label="Usage" />
            <NavItem icon={<FeatherActivity style={{ width: 15, height: 15 }} />} label="Performance" />
          </NavSection>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderTop: "1px solid #1f2228" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1f2228", border: "1px solid #474747", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FeatherUser style={{ width: 14, height: 14, color: "#7d8187" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <span style={{ fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Admin User</span>
          <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.06em", color: "#a0a4ab" }}>admin@company.com</span>
        </div>
      </div>
    </div>
  );
}

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

/* ─── User Row ────────────────────────────────────────────────────── */

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
  {
    name: "Alex Thompson",
    email: "alex.thompson@company.com",
    role: "Admin",
    roleVariant: "brand",
    lastActive: "2 min ago",
    status: "Active",
    avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417514/shared/ubsk7cs5hnnaj798efej.jpg",
    initials: "A",
  },
  {
    name: "Sarah Mitchell",
    email: "sarah.mitchell@company.com",
    role: "Editor",
    roleVariant: "neutral",
    lastActive: "15 min ago",
    status: "Active",
    avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg",
    initials: "S",
  },
  {
    name: "James Rodriguez",
    email: "james.rodriguez@company.com",
    role: "Viewer",
    roleVariant: "neutral",
    lastActive: "1 hour ago",
    status: "Active",
    avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/m0kfajqpwkfief00it4v.jpg",
    initials: "J",
  },
  {
    name: "Emily Chen",
    email: "emily.chen@company.com",
    role: "Editor",
    roleVariant: "warning",
    lastActive: "3 hours ago",
    status: "Offline",
    avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/btvntvzhdbhpulae3kzk.jpg",
    initials: "E",
  },
  {
    name: "Michael Park",
    email: "michael.park@company.com",
    role: "Admin",
    roleVariant: "brand",
    lastActive: "1 day ago",
    status: "Offline",
    avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif",
    initials: "M",
  },
];

/* ─── Page ────────────────────────────────────────────────────────── */

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

export default function AdminPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "flex-start", background: "#0c0c0b", overflow: "hidden" }}>

      {/* Sidebar — hidden on mobile, always visible md+ */}
      <div className="hidden md:flex" style={{ alignSelf: "stretch" }}>
        <AdminSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="md:hidden"
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="md:hidden"
            style={{ position: "fixed", inset: 0, right: "auto", zIndex: 50, display: "flex", animation: "slideInLeft 0.2s ease-out" }}
          >
            <AdminSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: "40px 40px 48px" }} className="admin-body">

          {/* Page header */}
          <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Hamburger — mobile only */}
              <button
                className="hamburger-btn"
                onClick={() => setSidebarOpen(true)}
                style={{ background: "none", border: "none", color: "#7d8187", cursor: "pointer", alignItems: "center", padding: 4, marginRight: 4, transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#7d8187")}
                aria-label="Open sidebar"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff", lineHeight: "43px" }}>
                  Admin Dashboard
                </span>
                <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>
                  Overview of your RAG chatbot platform
                </span>
              </div>
            </div>
            <div className="hidden md:flex" style={{ alignItems: "center", gap: 8 }}>
              <Button
                variant="neutral-secondary"
                icon={<FeatherDownload />}
                onClick={() => {}}
              >
                Export
              </Button>
              <Button
                icon={<FeatherPlus />}
                onClick={() => {}}
              >
                Add User
              </Button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <StatCard
              label="Total Users"
              value="1,284"
              trend="12.5%"
              trendColor="#3a9a4a"
              icon={<FeatherUsers />}
              iconVariant="brand"
            />
            <StatCard
              label="Total Documents"
              value="8,432"
              trend="8.2%"
              trendColor="#3a9a4a"
              icon={<FeatherFileText />}
              iconVariant="success"
            />
            <StatCard
              label="Storage Used"
              value="246 GB"
              trend="18.3%"
              trendColor="#c47800"
              icon={<FeatherHardDrive />}
              iconVariant="warning"
            />
            <StatCard
              label="Active Chats"
              value="342"
              trend="5.1%"
              trendColor="#3a9a4a"
              icon={<FeatherMessageCircle />}
              iconVariant="neutral"
            />
          </div>

          {/* Charts row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            {/* Line chart */}
            <div style={{
              flex: "1 1 384px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              borderRadius: 8,
              border: "1px solid #1f2228",
              background: "#0c0c0b",
              padding: 24,
            }}>
              <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Usage Over Time</span>
                <Button
                  variant="neutral-secondary"
                  size="small"
                  iconRight={<FeatherChevronDown />}
                  onClick={() => {}}
                >
                  Last 30 days
                </Button>
              </div>
              <LineChart
                className="h-64 w-full flex-none"
                categories={["Queries", "Documents Uploaded", "Active Users"]}
                data={LINE_DATA}
                index="Week"
              />
            </div>

            {/* Bar chart */}
            <div style={{
              flex: "1 1 320px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              borderRadius: 8,
              border: "1px solid #1f2228",
              background: "#0c0c0b",
              padding: 24,
            }}>
              <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Uploads by Type</span>
                <Button
                  variant="neutral-secondary"
                  size="small"
                  iconRight={<FeatherChevronDown />}
                  onClick={() => {}}
                >
                  This month
                </Button>
              </div>
              <BarChart
                className="h-64 w-full flex-none"
                categories={["PDF", "DOCX", "TXT", "CSV"]}
                data={BAR_DATA}
                index="Month"
              />
            </div>
          </div>

          {/* Users table */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            borderRadius: 8,
            border: "1px solid #1f2228",
            background: "#0c0c0b",
            padding: 24,
          }}>
            <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>Recent Users</span>
              <Button
                variant="neutral-tertiary"
                iconRight={<FeatherArrowRight />}
                onClick={() => {}}
              >
                View all
              </Button>
            </div>

            <div style={{ width: "100%", overflowX: "auto" }}>
              <Table
                header={
                  <Table.HeaderRow>
                    <Table.HeaderCell>Name</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>Role</Table.HeaderCell>
                    <Table.HeaderCell>Last Active</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell />
                  </Table.HeaderRow>
                }
              >
                {USERS.map((user) => (
                  <Table.Row key={user.email}>
                    <Table.Cell>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar size="small" image={user.avatar}>{user.initials}</Avatar>
                        <span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, fontWeight: 500, letterSpacing: "-0.025em", color: "#ffffff" }}>
                          {user.name}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>
                        {user.email}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={user.roleVariant}>{user.role}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>
                        {user.lastActive}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={user.status === "Active" ? "success" : "neutral"}>{user.status}</Badge>
                    </Table.Cell>
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
    </div>
  );
}
