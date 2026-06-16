"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; email?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, role")
        .eq("id", userId)
        .single();
      if (active) setProfile((data as Profile) ?? null);
    }

    // Initial session.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!active) return;
      setUser(user);
      if (user) loadProfile(user.id);
      setLoading(false);
    });

    // React to sign-in / sign-out.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        loadProfile(nextUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push("/login");
  }, [router]);

  const updateProfile = useCallback(
    async (updates: { full_name?: string; email?: string }) => {
      const supabase = createClient();

      if (updates.full_name !== undefined) {
        const { error } = await supabase
          .from("profiles")
          .update({ full_name: updates.full_name })
          .eq("id", user?.id);
        if (error) throw error;
        setProfile((prev) => (prev ? { ...prev, full_name: updates.full_name! } : prev));
      }

      if (updates.email !== undefined) {
        const { data, error } = await supabase.auth.updateUser({ email: updates.email });
        if (error) throw error;
        if (data.user) setUser(data.user);
      }
    },
    [user?.id]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user?.email) throw new Error("No authenticated user");
      const supabase = createClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) throw new Error("Current password is incorrect");

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
    },
    [user?.email]
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
