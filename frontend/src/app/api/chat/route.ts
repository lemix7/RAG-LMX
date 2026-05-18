import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({ detail: "Unknown error" }));
      return new Response(JSON.stringify(error), {
        status: backendResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Forward the stream body directly to the client
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return new Response(JSON.stringify({ detail: "Failed to connect to backend" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
