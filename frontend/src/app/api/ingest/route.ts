import { NextRequest } from "next/server";
import { BACKEND_URL, backendAuthHeaders } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    // Forward the mode ({ mode: "public" | "local" }) so the backend ingests
    // into the matching collection. Body may be absent (defaults to public).
    const body = await request.json().catch(() => ({}));

    const backendResponse = await fetch(`${BACKEND_URL}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await backendAuthHeaders()), // forward the user's Supabase JWT so the backend scopes to them
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => ({ detail: "Invalid response" }));

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ detail: "Failed to connect to backend" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
