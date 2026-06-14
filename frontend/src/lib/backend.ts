import { createClient } from "@/lib/supabase/server";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

/**
 * Builds the Authorization header to forward to the FastAPI backend.
 *
 * The backend authenticates every data route with the user's Supabase JWT
 * (verified against SUPABASE_JWT_SECRET) and scopes the vector store, docs
 * folder, and ingest registry to the token's `sub` claim. Each proxy route
 * must call this and spread the result into its fetch headers, otherwise the
 * backend responds 401.
 *
 * Returns an empty object when there is no session so the backend can return a
 * clear 401 (rather than us throwing here).
 */
export async function backendAuthHeaders(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {};
  }
  return { Authorization: `Bearer ${session.access_token}` };
}
