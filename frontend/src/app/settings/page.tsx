"use client";

import { useState } from "react";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SettingsHeader } from "./components/SettingsHeader";

import { Section } from "./components/Section";
import { InputField } from "./components/InputField";
import { Actions, GhostButton, FilledButton } from "./components/Buttons";
import { FeatherCheck, FeatherMail, FeatherShield, FeatherUser } from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

type Tab = "profile" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "flex-start", background: "#0c0c0b", overflow: "hidden" }}>

      {/* Sidebar — hidden on mobile, always visible md+ */}
      <div className="hidden md:flex" style={{ alignSelf: "stretch" }}>
        <SettingsSidebar />
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
            <SettingsSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "flex-start", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>
        <SettingsHeader onMenuClick={() => setSidebarOpen(true)} />

        <div style={{ display: "flex", flex: 1, flexDirection: "column", width: "100%", maxWidth: 768, gap: 32, padding: "48px", overflow: "auto" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #1f2228", gap: 0 }}>
            {(["profile", "security"] as Tab[]).map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 16px",
                    background: "transparent",
                    border: "none",
                    borderBottom: active ? "1px solid #ffffff" : "1px solid transparent",
                    marginBottom: -1,
                    color: active ? "#ffffff" : "#7d8187",
                    fontSize: 14,
                    fontFamily: FONT,
                    letterSpacing: "-0.025em",
                    cursor: "pointer",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#7d8187"; }}
                >
                  {tab === "profile"
                    ? <FeatherUser style={{ width: 13, height: 13 }} />
                    : <FeatherShield style={{ width: 13, height: 13 }} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              );
            })}
          </div>

          {activeTab === "profile" && (
            <>
              <Section title="Personal information" description="Update your name and email address.">
                <div style={{ display: "flex", gap: 12 }}>
                  <InputField label="First name" placeholder="Alex" />
                  <InputField label="Last name" placeholder="Morgan" />
                </div>
                <InputField
                  label="Email address"
                  type="email"
                  placeholder="alex@example.com"
                  icon={<FeatherMail style={{ width: 15, height: 15 }} />}
                />
              </Section>
              <Actions>
                <GhostButton>Cancel</GhostButton>
                <FilledButton>Save changes</FilledButton>
              </Actions>
            </>
          )}

          {activeTab === "security" && (
            <Section title="Change password" description="Update your password to keep your account secure.">
              <InputField label="Current password" type="password" placeholder="••••••••" />
              <InputField label="New password" type="password" placeholder="••••••••" />
              <InputField label="Confirm new password" type="password" placeholder="••••••••" />
              <Actions>
                <FilledButton>Update password</FilledButton>
              </Actions>
            </Section>
          )}

        </div>
      </div>
    </div>
  );
}
