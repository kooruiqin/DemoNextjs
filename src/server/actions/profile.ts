"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/server/auth";
import { requireSession } from "@/lib/session";
import { updateProfileSchema } from "@/lib/schemas/profile";

type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

export async function updateProfile(
  input: unknown,
): Promise<ActionResult<{ name: string }>> {
  await requireSession();

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: { name: parsed.data.name },
    });

    revalidatePath("/profile", "layout");
    return { data: { name: parsed.data.name } };
  } catch (e) {
    console.error("updateProfile failed:", e);
    return { error: "Failed to update profile" };
  }
}
