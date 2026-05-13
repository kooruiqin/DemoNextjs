"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";
import { requireAdmin } from "@/lib/permissions";
import { createUserSchema } from "@/lib/schemas/admin-user";

type ActionResult<T = void> =
  | { data: T; error?: never }
  | { data?: never; error: string; issues?: unknown };

type BetterAuthAPIError = {
  name?: string;
  body?: { message?: string; code?: string };
};

function isApiError(e: unknown): e is BetterAuthAPIError {
  return typeof e === "object" && e !== null && (e as { name?: string }).name === "APIError";
}

export async function createUser(input: unknown): Promise<ActionResult> {
  await requireAdmin();

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input", issues: parsed.error.issues };
  }

  try {
    await auth.api.createUser({
      headers: await headers(),
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.name,
        role: parsed.data.role,
      },
    });
    revalidatePath("/backend/users");
    return { data: undefined };
  } catch (e) {
    if (isApiError(e)) {
      if (e.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        return { error: "A user with that email already exists" };
      }
      if (e.body?.message) {
        return { error: e.body.message };
      }
    }
    console.error("createUser failed:", e);
    return { error: "Failed to create user" };
  }
}

export async function setUserRole(
  userId: string,
  role: "admin" | "user",
): Promise<ActionResult> {
  await requireAdmin();
  if (!userId) return { error: "Missing user id" };

  try {
    await auth.api.setRole({
      headers: await headers(),
      body: { userId, role },
    });
    revalidatePath("/backend/users");
    return { data: undefined };
  } catch (e) {
    console.error("setUserRole failed:", e);
    return { error: "Failed to update role" };
  }
}

export async function banUser(
  userId: string,
  banReason?: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!userId) return { error: "Missing user id" };

  try {
    await auth.api.banUser({
      headers: await headers(),
      body: { userId, banReason: banReason || "Banned by an admin" },
    });
    revalidatePath("/backend/users");
    return { data: undefined };
  } catch (e) {
    console.error("banUser failed:", e);
    return { error: "Failed to ban user" };
  }
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!userId) return { error: "Missing user id" };

  try {
    await auth.api.unbanUser({
      headers: await headers(),
      body: { userId },
    });
    revalidatePath("/backend/users");
    return { data: undefined };
  } catch (e) {
    console.error("unbanUser failed:", e);
    return { error: "Failed to unban user" };
  }
}
