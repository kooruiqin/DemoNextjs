"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { walletEntries, walletEntryLabels, walletLabels } from "@/db/schema/wallet";
import { requireSession } from "@/lib/session";
import {
  createWalletEntrySchema,
  createWalletLabelSchema,
} from "@/lib/schemas/wallet";

type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

export async function createWalletEntry(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();

  const parsed = createWalletEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { kind, amount, occurredAt, labelIds } = parsed.data;
  const place = parsed.data.place?.trim() || null;
  const description = parsed.data.description?.trim() || null;

  try {
    const validLabelIds = labelIds.length
      ? (
          await db
            .select({ id: walletLabels.id })
            .from(walletLabels)
            .where(
              and(
                eq(walletLabels.userId, session.user.id),
                inArray(walletLabels.id, labelIds),
              ),
            )
        ).map((r) => r.id)
      : [];

    const created = await db.transaction(async (tx) => {
      const [entry] = await tx
        .insert(walletEntries)
        .values({
          userId: session.user.id,
          kind,
          amount,
          place,
          description,
          occurredAt: new Date(`${occurredAt}T00:00:00`),
        })
        .returning({ id: walletEntries.id });

      if (validLabelIds.length) {
        await tx
          .insert(walletEntryLabels)
          .values(validLabelIds.map((labelId) => ({ entryId: entry.id, labelId })));
      }

      return entry;
    });

    revalidatePath("/wallet");
    return { data: { id: created.id } };
  } catch (e) {
    console.error("createWalletEntry failed:", e);
    return { error: "Failed to create entry" };
  }
}

export async function deleteWalletEntry(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();

  if (!id || typeof id !== "string") return { error: "Invalid id" };

  try {
    const [deleted] = await db
      .delete(walletEntries)
      .where(and(eq(walletEntries.id, id), eq(walletEntries.userId, session.user.id)))
      .returning({ id: walletEntries.id });

    if (!deleted) return { error: "Entry not found" };

    revalidatePath("/wallet");
    return { data: { id: deleted.id } };
  } catch (e) {
    console.error("deleteWalletEntry failed:", e);
    return { error: "Failed to delete entry" };
  }
}

export async function createWalletLabel(
  input: unknown,
): Promise<ActionResult<{ id: string; name: string; color: string }>> {
  const session = await requireSession();

  const parsed = createWalletLabelSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [created] = await db
      .insert(walletLabels)
      .values({
        userId: session.user.id,
        name: parsed.data.name,
        color: parsed.data.color,
      })
      .returning({
        id: walletLabels.id,
        name: walletLabels.name,
        color: walletLabels.color,
      });

    revalidatePath("/wallet");
    return { data: created };
  } catch (e: unknown) {
    // Unique violation on (userId, name)
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "23505"
    ) {
      return { error: "A label with that name already exists" };
    }
    console.error("createWalletLabel failed:", e);
    return { error: "Failed to create label" };
  }
}
