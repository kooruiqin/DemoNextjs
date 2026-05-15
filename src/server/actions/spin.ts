"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { spinRecords, foodOptions } from "@/db/schema/spin";
import { requireSession } from "@/lib/session";
import {
  createSpinRecordSchema,
  markSpinRecordSchema,
} from "@/lib/schemas/spin";
import type { SpinRecord } from "@/lib/mock/daily";

type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

export async function createSpinRecord(
  input: unknown,
): Promise<ActionResult<SpinRecord>> {
  const session = await requireSession();

  const parsed = createSpinRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { mealType, optionName } = parsed.data;
  let optionId: string | null = parsed.data.optionId ?? null;

  try {
    // Only honor optionId if it actually belongs to this user. Avoids FK
    // failures from stale / mock IDs leaking in from the client.
    if (optionId) {
      const [owned] = await db
        .select({ id: foodOptions.id })
        .from(foodOptions)
        .where(
          and(eq(foodOptions.id, optionId), eq(foodOptions.userId, session.user.id)),
        );
      if (!owned) optionId = null;
    }

    const [row] = await db
      .insert(spinRecords)
      .values({
        userId: session.user.id,
        mealType,
        optionId,
        optionName,
      })
      .returning();

    revalidatePath("/spin");

    return {
      data: {
        id: row.id,
        mealType: row.mealType as "lunch" | "dinner",
        optionName: row.optionName,
        accepted: row.accepted,
        createdAt: row.createdAt,
      },
    };
  } catch (e) {
    console.error("createSpinRecord failed:", e);
    return { error: "Failed to save spin" };
  }
}

export async function markSpinRecord(
  input: unknown,
): Promise<ActionResult<{ id: string; accepted: boolean }>> {
  const session = await requireSession();

  const parsed = markSpinRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [updated] = await db
      .update(spinRecords)
      .set({ accepted: parsed.data.accepted })
      .where(
        and(
          eq(spinRecords.id, parsed.data.id),
          eq(spinRecords.userId, session.user.id),
        ),
      )
      .returning({ id: spinRecords.id, accepted: spinRecords.accepted });

    if (!updated) return { error: "Record not found" };

    revalidatePath("/spin");
    return { data: { id: updated.id, accepted: updated.accepted ?? false } };
  } catch (e) {
    console.error("markSpinRecord failed:", e);
    return { error: "Failed to update spin" };
  }
}
