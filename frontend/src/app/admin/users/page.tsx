"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { Table } from "@/ui/components/Table";
import {
  FeatherMoreHorizontal,
  FeatherSearch,
  FeatherShield,
  FeatherTrash,
  FeatherUser,
  FeatherUsers,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { createClient } from "@/lib/supabase/client";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface UserRow {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
  created_at: string;
  email: string;
}

const ROLES = ["All Roles", "admin", "user"] as const;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(name: string | null, email: string) {
  if (name?.trim()) {
    return name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  return email[0].toUpperCase();
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLES)[number]>("All Roles");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Fetch profiles joined with auth emails via the admin-readable profiles table
      // auth.users email is not directly accessible from client — we use profiles only
      // and get email by calling the Supabase admin API through our own route
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .order("created_at", { ascending: false });

      if (error || !data) { setLoading(false); return; }

      // Fetch emails from our API route (server-side Supabase admin client)
      const emailRes = await fetch("/api/admin/users").catch(() => null);
      const emailMap: Record<string, string> = {};
      if (emailRes?.ok) {
        const json = await emailRes.json();
        for (const u of json.users ?? []) emailMap[u.id] = u.email;
      }

      setUsers(data.map((p) => ({ ...p, email: emailMap[p.id] ?? "" })));
      setLoading(false);
    }
    load();
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = !search ||
      (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All Roles" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;

  async function handleRoleChange(id: string, newRole: "user" | "admin") {
    const supabase = createClient();
    await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
  }

  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "column", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 48, padding: "40px 40px 48px" }} className="admin-body">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", color: "#ffffff", lineHeight: 1.2 }}>Users</span>
          <span style={{ fontSize: 16, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187", lineHeight: 1.5 }}>Manage who has access to the platform</span>
        </motion.div>

        {/* Stat cards */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: "#1f2228" }}>
          {[
            { label: "Total Users", value: users.length,  icon: <FeatherUsers  style={{ width: 15, height: 15 }} />, color: "#2563eb" },
            { label: "Admins",      value: adminCount,     icon: <FeatherShield style={{ width: 15, height: 15 }} />, color: "#c47800" },
            { label: "Regular Users", value: users.length - adminCount, icon: <FeatherUser style={{ width: 15, height: 15 }} />, color: "#3a9a4a" },
          ].map(({ label, value, icon, color }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", flex: 1, minWidth: 120, flexDirection: "column", gap: 10, padding: 16, background: "#0c0c0b" }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>{label}</span>
                <span style={{ color, display: "flex", opacity: 0.8 }}>{icon}</span>
              </div>
              <span style={{ fontSize: 36, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#ffffff" }}>
                {loading ? "—" : value}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Users table */}
        <div style={{ display: "flex", flexDirection: "column", border: "1px solid #1f2228", background: "#0c0c0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 12px", borderBottom: "1px solid #1f2228" }}>
            <span style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", color: "#7d8187", textTransform: "uppercase" }}>All Users</span>
            <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#474747" }}>{filtered.length} of {users.length}</span>
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
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ROLES.map((r) => {
                const active = roleFilter === r;
                return (
                  <button key={r} onClick={() => setRoleFilter(r)}
                    style={{ padding: "4px 12px", borderRadius: 9999, border: `1px solid ${active ? "#2563eb" : "#1f2228"}`, background: active ? "#1a3568" : "transparent", color: active ? "#ffffff" : "#7d8187", fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.color = "#ffffff"; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = "#1f2228"; e.currentTarget.style.color = "#7d8187"; } }}
                  >{r === "All Roles" ? "All Roles" : r === "admin" ? "Admin" : "User"}</button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ width: "100%", overflowX: "auto" }}>
            {loading ? (
              <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, fontFamily: MONO, color: "#474747", letterSpacing: "0.08em" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", fontSize: 13, fontFamily: MONO, color: "#474747", letterSpacing: "0.08em" }}>No users found</div>
            ) : (
              <Table header={
                <Table.HeaderRow>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Role</Table.HeaderCell>
                  <Table.HeaderCell>Joined</Table.HeaderCell>
                  <Table.HeaderCell />
                </Table.HeaderRow>
              }>
                {filtered.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar size="small">{getInitials(user.full_name, user.email)}</Avatar>
                        <span style={{ whiteSpace: "nowrap", fontSize: 15, fontFamily: FONT, fontWeight: 500, letterSpacing: "-0.025em", color: "#ffffff" }}>
                          {user.full_name || "—"}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span style={{ whiteSpace: "nowrap", fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187" }}>{user.email || "—"}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={user.role === "admin" ? "brand" : "neutral"}>{user.role}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <span style={{ whiteSpace: "nowrap", fontSize: 13, fontFamily: MONO, letterSpacing: "0.05em", color: "#474747" }}>{formatDate(user.created_at)}</span>
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
                                {user.role === "user" ? (
                                  <DropdownMenu.DropdownItem icon={<FeatherShield />} onClick={() => handleRoleChange(user.id, "admin")}>
                                    Make Admin
                                  </DropdownMenu.DropdownItem>
                                ) : (
                                  <DropdownMenu.DropdownItem icon={<FeatherUser />} onClick={() => handleRoleChange(user.id, "user")}>
                                    Remove Admin
                                  </DropdownMenu.DropdownItem>
                                )}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
