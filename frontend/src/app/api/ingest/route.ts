import { NextRequest } from "next/server";
import { BACKEND_URL, backendAuthHeaders } from "@/lib/backend";

export async function POST(_request: NextRequest) {
  try {
    const backendResponse = await fetch(`${BACKEND_URL}/ingest`, {
      method: "POST",
      headers: { ...(await backendAuthHeaders()) }, // forward the user's Supabase JWT so the backend scopes to them
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
