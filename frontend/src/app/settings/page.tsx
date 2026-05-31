"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppSidebar } from "@/components/AppSidebar";
import { SettingsHeader } from "./components/SettingsHeader";
import { Section } from "./components/Section";
import { InputField } from "./components/InputField";
import { Actions, GhostButton, FilledButton } from "./components/Buttons";
import { FeatherCheck, FeatherMail, FeatherShield, FeatherUser } from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

type Tab = "profile" | "security";

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  profile:  <FeatherUser   style={{ width: 13, height: 13 }} />,
  security: <FeatherShield style={{ width: 13, height: 13 }} />,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100%", width: "100%", alignItems: "flex-start", background: "#0c0c0b", overflow: "hidden" }}>

      {/* Sidebar — hidden on mobile, always visible md+ */}
      <div className="hidden md:flex" style={{ alignSelf: "stretch" }}>
        <AppSidebar />
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
            <AppSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div style={{ display: "flex", flex: 1, flexDirection: "column", alignItems: "flex-start", alignSelf: "stretch", overflow: "auto", minWidth: 0 }}>

        {/* Header slides down on mount */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%", flexShrink: 0 }}
        >
          <SettingsHeader onMenuClick={() => setSidebarOpen(true)} />
        </motion.div>

        <div style={{ display: "flex", flex: 1, flexDirection: "column", width: "100%", maxWidth: 768, gap: 32, padding: "48px", overflow: "auto" }}>

          {/* Tab bar fades up */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #1f2228", gap: 0 }}
          >
            {(["profile", "security"] as Tab[]).map((tab) => {
              const active = activeTab === tab;
              return (
                <motion.button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  whileTap={{ scale: 0.96 }}
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
                    position: "relative",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#7d8187"; }}
                >
                  {TAB_ICONS[tab]}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Tab content — AnimatePresence for cross-fade on switch */}
          <AnimatePresence mode="wait">
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "flex", flexDirection: "column", gap: 32 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <Section title="Personal information" description="Update your name and email address.">
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.1 }}
                      style={{ display: "flex", gap: 12 }}
                    >
                      <InputField label="First name" placeholder="Alex" />
                      <InputField label="Last name" placeholder="Morgan" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.16 }}
                    >
                      <InputField
                        label="Email address"
                        type="email"
                        placeholder="alex@example.com"
                        icon={<FeatherMail style={{ width: 15, height: 15 }} />}
                      />
                    </motion.div>
                  </Section>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.22 }}
                >
                  <Actions>
                    <GhostButton>Cancel</GhostButton>
                    <FilledButton>Save changes</FilledButton>
                  </Actions>
                </motion.div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Section title="Change password" description="Update your password to keep your account secure.">
                  {["Current password", "New password", "Confirm new password"].map((label, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: 0.06 + i * 0.07 }}
                    >
                      <InputField label={label} type="password" placeholder="••••••••" />
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.27 }}
                  >
                    <Actions>
                      <FilledButton>Update password</FilledButton>
                    </Actions>
                  </motion.div>
                </Section>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
