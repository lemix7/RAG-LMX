import { NextRequest } from "next/server";
import { BACKEND_URL, backendAuthHeaders } from "@/lib/backend";

// This file is a proxy (middle man) between the browser and the backend server. the browser use it to make calls to the backend

export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); // recieves the user question

    const backendResponse = await fetch(`${BACKEND_URL}/chat`, { // send the question to the backend
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(await backendAuthHeaders()), // forward the user's Supabase JWT so the backend scopes to them
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

    // Forward the stream body directly to the client
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8", // tells the browser to expect data in chunks streaming
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
      },
    });
    
  } 
  catch {
    return new Response(JSON.stringify({ detail: "Failed to connect to backend" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
