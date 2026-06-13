import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

  // Weekly buckets for the last 8 weeks
  const { data: weeklyConvs } = await adminClient.rpc("admin_weekly_conversations", { weeks: 8 }).catch(() => ({ data: null }));
  const { data: weeklyUsers } = await adminClient.rpc("admin_weekly_users", { weeks: 8 }).catch(() => ({ data: null }));

  // Recent activity: last 10 profile creations + last 10 conversations
  const [{ data: recentProfiles }, { data: recentConvs }] = await Promise.all([
    adminClient.from("profiles").select("id, full_name, created_at").order("created_at", { ascending: false }).limit(6),
    adminClient.from("conversations").select("id, title, user_id, created_at").order("created_at", { ascending: false }).limit(6),
  ]);

  return NextResponse.json({
    weeklyConversations: weeklyConvs ?? [],
    weeklyUsers: weeklyUsers ?? [],
    recentProfiles: recentProfiles ?? [],
    recentConversations: recentConvs ?? [],
  });
}
