import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    // Read incoming multipart form data and forward as-is
    const formData = await request.formData();

    const backendResponse = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData,
      // NOTE: Do NOT set Content-Type — fetch sets multipart boundary automatically
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
