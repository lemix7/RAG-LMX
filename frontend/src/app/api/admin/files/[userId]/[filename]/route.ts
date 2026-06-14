import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string; filename: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, filename } = await params;
  try {
    const res = await fetch(
      `${BACKEND_URL}/admin/files/${encodeURIComponent(userId)}/${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
        headers: { "x-admin-secret": process.env.ADMIN_API_SECRET ?? "" },
      }
    );
    const data = await res.json().catch(() => ({ detail: "Invalid response" }));
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Failed to connect to backend" }, { status: 503 });
  }
}
