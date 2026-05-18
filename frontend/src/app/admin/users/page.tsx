"use client";

import { useState } from "react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { Table } from "@/ui/components/Table";
import {
  FeatherEdit2,
  FeatherMoreHorizontal,
  FeatherPlus,
  FeatherSearch,
  FeatherTrash,
  FeatherUser,
  FeatherUsers,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface UserData {
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  roleVariant: "brand" | "neutral" | "warning";
  lastActive: string;
  status: "Active" | "Offline";
  joined: string;
  avatar?: string;
  initials: string;
}

const ALL_USERS: UserData[] = [
  { name: "Alex Thompson",   email: "alex.thompson@company.com",   role: "Admin",  roleVariant: "brand",   lastActive: "2 min ago",   status: "Active",  joined: "Jan 12, 2024", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417514/shared/ubsk7cs5hnnaj798efej.jpg",  initials: "AT" },
  { name: "Sarah Mitchell",  email: "sarah.mitchell@company.com",  role: "Editor", roleVariant: "neutral", lastActive: "15 min ago",  status: "Active",  joined: "Feb 3, 2024",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417513/shared/kwut7rhuyivweg8tmyzl.jpg",  initials: "SM" },
  { name: "James Rodriguez", email: "james.rodriguez@company.com", role: "Viewer", roleVariant: "neutral", lastActive: "1 hour ago",  status: "Active",  joined: "Feb 20, 2024", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/m0kfajqpwkfief00it4v.jpg",  initials: "JR" },
  { name: "Emily Chen",      email: "emily.chen@company.com",      role: "Editor", roleVariant: "neutral", lastActive: "3 hours ago", status: "Offline", joined: "Mar 5, 2024",  avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417512/shared/btvntvzhdbhpulae3kzk.jpg",  initials: "EC" },
  { name: "Michael Park",    email: "michael.park@company.com",    role: "Admin",  roleVariant: "brand",   lastActive: "1 day ago",   status: "Offline", joined: "Mar 18, 2024", avatar: "https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/fychrij7dzl8wgq2zjq9.avif", initials: "MP" },
  { name: "Priya Sharma",    email: "priya.sharma@company.com",    role: "Viewer", roleVariant: "neutral", lastActive: "2 days ago",  status: "Offline", joined: "Apr 1, 2024",  initials: "PS" },
  { name: "Lucas Fernandez", email: "lucas.fernandez@company.com", role: "Editor", roleVariant: "neutral", lastActive: "5 min ago",   status: "Active",  joined: "Apr 14, 2024", initials: "LF" },
  { name: "Nina Patel",      email: "nina.patel@company.com",      role: "Viewer", roleVariant: "neutral", lastActive: "30 min ago",  status: "Active",  joined: "May 2, 2024",  initials: "NP" },
];

const ROLES = ["All Roles", "Admin", "Editor", "Viewer"] as const;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLES)[number]>("All Roles");
  const [focused, setFocused] = useState(false);

  const filtered = ALL_USERS.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const activeCount = ALL_USERS.filter((u) => u.status === "Active").length;

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "40px 40px 48px" }} className="admin-body">

        {/* Page header */}
        <div style={{ display: "flex", width: "100%", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff", lineHeight: 1.2 }}>Users</span>
            <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187", lineHeight: 1.5 }}>Manage who has access to the platform</span>
          </div>
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", background: "#ffffff", color: "#0c0c0b", border: "none", borderRadius: 9999, fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", cursor: "pointer", transition: "opacity 0.15s", flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <FeatherPlus style={{ width: 14, height: 14 }} /> Add User
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "#1f2228" }}>
          {[
            { label: "Total Users",   value: ALL_USERS.length,                                      icon: <FeatherUsers style={{ width: 15, height: 15 }} />, color: "#2563eb" },
            { label: "Active",        value: activeCount,                                            icon: <FeatherUser  style={{ width: 15, height: 15 }} />, color: "#3a9a4a" },
            { label: "Admins",        value: ALL_USERS.filter((u) => u.role === "Admin").length,    icon: <FeatherUser  style={{ width: 15, height: 15 }} />, color: "#c47800" },
            { label: "Offline",       value: ALL_USERS.length - activeCount,                        icon: <FeatherUser  style={{ width: 15, height: 15 }} />, color: "#474747" },
          ].map(({ label, value, icon, color }) => (
            <div key={label} style={{ display: "flex", flex: 1, minWidth: 120, flexDirection: "column", gap: 12, padding: 16, background: "#0c0c0b" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>{label}</span>
                <span style={{ color, display: "flex", opacity: 0.8 }}>{icon}</span>
              </div>
              <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#ffffff" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Users table card */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #1f2228", background: "#0c0c0b" }}>
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid #1f2228" }}>
            <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>All Users</span>
            <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#474747" }}>{filtered.length} of {ALL_USERS.length}</span>
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #1f2228" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: 240 }}>
              <span style={{ position: "absolute", left: 12, color: "#474747", display: "flex", alignItems: "center", pointerEvents: "none" }}>
                <FeatherSearch style={{ width: 13, height: 13 }} />
              </span>
              <input
                type="text"
                placeholder="Search users…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{ width: "100%", background: "#0c0c0b", color: "#ffffff", border: `1px solid ${focused ? "#2563eb" : "#1f2228"}`, borderRadius: 9999, padding: "8px 14px 8px 32px", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                onMouseEnter={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#474747"; }}
                onMouseLeave={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#1f2228"; }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ROLES.map((r) => {
                const active = roleFilter === r;
                return (
                  <button key={r} onClick={() => setRoleFilter(r)} style={{ padding: "4px 12px", borderRadius: 9999, border: `1px solid ${active ? "#2563eb" : "#1f2228"}`, background: active ? "#1a3568" : "transparent", color: active ? "#ffffff" : "#7d8187", fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.color = "#ffffff"; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#7d8187"; } }}
                  >{r}</button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            <Table header={
              <Table.HeaderRow>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Role</Table.HeaderCell>
                <Table.HeaderCell>Joined</Table.HeaderCell>
                <Table.HeaderCell>Last Active</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.HeaderRow>
            }>
              {filtered.map((user) => (
                <Table.Row key={user.email}>
                  <Table.Cell>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar size="small" image={user.avatar}>{user.initials}</Avatar>
                      <span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, fontWeight: 500, letterSpacing: "-0.025em", color: "#ffffff" }}>{user.name}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>{user.email}</span></Table.Cell>
                  <Table.Cell><Badge variant={user.roleVariant}>{user.role}</Badge></Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 13, fontFamily: MONO, letterSpacing: "0.05em", color: "#474747" }}>{user.joined}</span></Table.Cell>
                  <Table.Cell><span style={{ whiteSpace: "nowrap", fontSize: 13, fontFamily: MONO, letterSpacing: "0.05em", color: "#474747" }}>{user.lastActive}</span></Table.Cell>
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
