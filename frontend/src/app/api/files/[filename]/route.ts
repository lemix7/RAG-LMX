import { NextRequest } from "next/server";
import { BACKEND_URL } from "@/lib/backend";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  try {
    const backendResponse = await fetch(
      `${BACKEND_URL}/files/${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    );
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
