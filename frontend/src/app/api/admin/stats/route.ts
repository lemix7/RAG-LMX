import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

// Fetch system-wide document stats from the backend (across all users' folders).
// Gated by the shared ADMIN_API_SECRET; the caller is already verified as admin.
async function fetchDocumentStats() {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/document-stats`, {
      headers: { "x-admin-secret": process.env.ADMIN_API_SECRET ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Returns analytics data for the admin dashboard.
// Uses the service-role key to read across all users.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Weekly buckets for the last 8 weeks. The Supabase builder is a thenable, not
  // a Promise, so await it and read `error` rather than chaining `.catch()`.
  const [convRes, usersRes] = await Promise.all([
    adminClient.rpc("admin_weekly_conversations", { weeks: 8 }),
    adminClient.rpc("admin_weekly_users", { weeks: 8 }),
  ]);
  const weeklyConvs = convRes.error ? null : convRes.data;
  const weeklyUsers = usersRes.error ? null : usersRes.data;
  if (convRes.error)  console.error("admin_weekly_conversations failed:", convRes.error.message);
  if (usersRes.error) console.error("admin_weekly_users failed:", usersRes.error.message);

  // Recent activity: last 10 profile creations + last 10 conversations
  const [{ data: recentProfiles }, { data: recentConvs }, documentStats] = await Promise.all([
    adminClient.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(6),
    adminClient.from("conversations").select("id, title, user_id, created_at").order("created_at", { ascending: false }).limit(6),
    fetchDocumentStats(),
  ]);

  return NextResponse.json({
    weeklyConversations: weeklyConvs ?? [],
    weeklyUsers: weeklyUsers ?? [],
    recentProfiles: recentProfiles ?? [],
    recentConversations: recentConvs ?? [],
    documentStats: documentStats ?? { total_documents: 0, total_bytes: 0, by_type: {} },
  });
}
