import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export type SessionUserRole = "admin" | "user" | (string & {});

/**
 * Returns true if the given session user has the admin role.
 * Better-Auth's admin plugin stores the role on user.role.
 */
export function isAdmin(role: string | null | undefined): boolean {
  return role === "admin";
}

/**
 * Get session and redirect to /dashboard if the current user is not an admin.
 * Use at the top of admin-only Server Components.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!isAdmin(role)) redirect("/dashboard");
  return session;
}
