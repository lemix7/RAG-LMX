"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  FeatherArrowRight,
  FeatherBot,
  FeatherMail,
  FeatherMessageSquare,
  FeatherShield,
  FeatherUploadCloud,
  FeatherLock,
} from "@subframe/core";

const FONT = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";
const MONO = "var(--font-space-mono), ui-monospace, monospace";

function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  helpText,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  helpText?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      <label
        style={{
          fontSize: 15,
          fontFamily: FONT,
          fontWeight: 400,
          lineHeight: 1.5,
          color: "#7d8187",
        }}
      >
        {label}
      </label>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {icon && (
          <span style={{ position: "absolute", left: 16, color: "#474747", display: "flex", alignItems: "center", pointerEvents: "none" }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "#0c0c0b",
            color: "#ffffff",
            border: `1px solid ${focused ? "#2563eb" : "#1f2228"}`,
            borderRadius: 12,
            padding: icon ? "12px 16px 12px 44px" : "12px 16px",
            fontSize: 15,
            fontFamily: FONT,
            fontWeight: 400,
            letterSpacing: "-0.025em",
            lineHeight: 1.5,
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#474747"; }}
          onMouseLeave={(e) => { if (!focused) (e.target as HTMLInputElement).style.borderColor = "#1f2228"; }}
        />
      </div>
      {helpText && (
        <p style={{ fontSize: 11, color: "#474747", fontFamily: MONO, letterSpacing: "0.06em", lineHeight: 1.6, margin: 0 }}>{helpText}</p>
      )}
    </div>
  );
}

const features = [
  {
    icon: <FeatherUploadCloud style={{ width: 16, height: 16, color: "#ffffff" }} />,
    title: "Upload your documents",
    desc: "Ingest PDFs, DOCX, TXT, and CSV files into your knowledge base.",
  },
  {
    icon: <FeatherMessageSquare style={{ width: 16, height: 16, color: "#ffffff" }} />,
    title: "Chat with your data",
    desc: "Ask natural language questions and get accurate, cited answers.",
  },
  {
    icon: <FeatherShield style={{ width: 16, height: 16, color: "#ffffff" }} />,
    title: "Enterprise-grade security",
    desc: "Your data stays private with role-based access controls.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-full w-full flex-col md:flex-row" style={{ background: "#0c0c0b" }}>

      {/* ── Left panel — full-cover image, hidden on mobile ── */}
      <div
        className="hidden md:block"
        style={{ flex: 1, position: "relative", overflow: "hidden" }}
      >
        <img
          src="/sidebar-image.png"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* ── Right panel — form ── */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-6 py-10 md:px-10 md:py-12"
        style={{ background: "#0c0c0b", overflowY: "auto" }}
      >
        {/* Mobile logo */}
        <div className="flex flex-col items-center gap-3 mb-8 md:hidden">
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1a3568", border: "1px solid #2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FeatherBot style={{ width: 22, height: 22, color: "#ffffff" }} />
          </div>
          <span style={{ fontSize: 18, fontFamily: FONT, letterSpacing: "-0.025em", color: "#ffffff" }}>RAG Admin</span>
        </div>

        <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <h2 style={{ fontSize: 24, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em", lineHeight: 1.2, color: "#ffffff", textAlign: "center", margin: 0 }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em", lineHeight: 1.5, color: "#7d8187", textAlign: "center", margin: 0 }}>
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <InputField label="Email address" type="email" placeholder="you@company.com" value={email} onChange={setEmail} icon={<FeatherMail style={{ width: 15, height: 15 }} />} />
            <InputField label="Password" type="password" placeholder="Your password" value={password} onChange={setPassword} icon={<FeatherLock style={{ width: 15, height: 15 }} />} />

            {/* Forgot password */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#474747", cursor: "pointer", fontSize: 12, fontFamily: MONO, letterSpacing: "0.06em", textDecoration: "underline", textUnderlineOffset: 3, padding: 0, transition: "color 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p style={{ fontSize: 12, fontFamily: MONO, letterSpacing: "0.06em", color: "#f05070", textAlign: "center", margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                width: "100%", padding: "12px 20px",
                background: isLoading ? "#1f2228" : "#ffffff",
                color: "#0c0c0b", border: "none", borderRadius: 9999,
                fontSize: 14, fontFamily: FONT, fontWeight: 400, letterSpacing: "-0.025em",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s", opacity: isLoading ? 0.6 : 1,
                marginTop: 4,
              }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.opacity = "1"; }}
            >
              {isLoading ? "Signing in…" : "Sign in"}
              {!isLoading && <FeatherArrowRight style={{ width: 15, height: 15 }} />}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: "#1f2228" }} />
            <span style={{ fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", color: "#fff", whiteSpace: "nowrap" }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: "#1f2228" }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: "11px 20px",
              background: "transparent", color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9999,
              fontSize: 14, fontFamily: FONT, letterSpacing: "-0.025em",
              cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#474747"; e.currentTarget.style.background = "#1f2228"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "transparent"; }}
          >
            <img src="https://res.cloudinary.com/subframe/image/upload/v1711417516/shared/z0i3zyjjqkobzuaecgno.svg" alt="Google" style={{ width: 18, height: 18, objectFit: "contain" }} />
            Sign in with Google
          </button>

          {/* Signup link */}
          <p style={{ fontSize: 13, fontFamily: FONT, letterSpacing: "-0.025em", color: "#7d8187", textAlign: "center", margin: 0 }}>
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => router.push("/signup")} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", fontSize: "inherit", fontFamily: "inherit", letterSpacing: "inherit", textDecoration: "underline", textUnderlineOffset: 3, padding: 0 }}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
