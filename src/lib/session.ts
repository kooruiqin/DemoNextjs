import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

/**
 * Get the current session in a Server Component or Server Action.
 * Returns null if not signed in.
 */
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

/**
 * Get the current session, redirecting to /login if not signed in.
 * Use this in protected pages and Server Actions that require auth.
 */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
