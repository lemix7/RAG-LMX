import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function GET(_request: NextRequest) {
  try {
    const backendResponse = await fetch(`${BACKEND_URL}/model`, {
      method: "GET",
      cache: "no-store",
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
