"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FeatherActivity,
  FeatherBarChart2,
  FeatherBookOpen,
  FeatherDatabase,
  FeatherFileText,
  FeatherLayers,
  FeatherMessageSquare,
  FeatherSettings,
  FeatherShield,
  FeatherUser,
  FeatherUsers,
  FeatherX,
} from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  selected?: boolean;
}

function NavItem({ icon, label, href, selected }: NavItemProps) {
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

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#474747", textTransform: "uppercase", padding: "8px 12px 4px" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

interface AdminSidebarProps {
  onClose?: () => void;
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
  const pathname = usePathname();

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
        {/* <NavItem icon={<FeatherMessageSquare style={{ width: 15, height: 15 }} />} label="Chat" href="/" />
        <NavItem icon={<FeatherBookOpen style={{ width: 15, height: 15 }} />} label="Knowledge Base" href="/knowledge-base" />
        <NavItem icon={<FeatherSettings style={{ width: 15, height: 15 }} />} label="Settings" href="/settings" /> */}
        <NavItem icon={<FeatherShield style={{ width: 15, height: 15 }} />} label="Dashboard" href="/admin" selected={pathname === "/admin"} />

        <div style={{ marginTop: 8 }}>
          <NavSection label="Management">
            <NavItem icon={<FeatherUsers style={{ width: 15, height: 15 }} />} label="Users" href="/admin/users" selected={pathname === "/admin/users"} />
            <NavItem icon={<FeatherFileText style={{ width: 15, height: 15 }} />} label="Documents" href="/admin/documents" selected={pathname === "/admin/documents"} />
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
          <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#a0a4ab" }}>admin@company.com</span>
        </div>
      </div>
    </div>
  );
}
