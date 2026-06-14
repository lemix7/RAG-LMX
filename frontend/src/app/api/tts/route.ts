import { NextRequest } from "next/server";
import { BACKEND_URL, backendAuthHeaders } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await backendAuthHeaders()), // forward the user's Supabase JWT (backend gates voice routes too)
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({ detail: "Unknown error" }));
      return new Response(JSON.stringify(error), {
        status: backendResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Forward the audio bytes straight back to the client
    return new Response(backendResponse.body, {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch {
    return new Response(JSON.stringify({ detail: "Failed to connect to backend" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
