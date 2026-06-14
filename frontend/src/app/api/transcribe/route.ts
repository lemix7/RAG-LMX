import { NextRequest } from "next/server";
import { BACKEND_URL, backendAuthHeaders } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    // Read incoming multipart form data (the recorded audio) and forward as-is
    const formData = await request.formData();

    const backendResponse = await fetch(`${BACKEND_URL}/transcribe`, {
      method: "POST",
      headers: { ...(await backendAuthHeaders()) }, // forward the user's Supabase JWT (no Content-Type — fetch sets the multipart boundary)
      body: formData,
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
