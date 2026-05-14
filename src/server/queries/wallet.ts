import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  walletEntries,
  walletEntryLabels,
  walletLabels,
} from "@/db/schema/wallet";
import { requireSession } from "@/lib/session";
import type { WalletEntry, WalletLabel } from "@/lib/mock/daily";

export async function listWalletLabels(): Promise<WalletLabel[]> {
  const session = await requireSession();

  const rows = await db
    .select({
      id: walletLabels.id,
      name: walletLabels.name,
      color: walletLabels.color,
    })
    .from(walletLabels)
    .where(eq(walletLabels.userId, session.user.id))
    .orderBy(asc(walletLabels.name));

  return rows;
}

export async function listWalletEntries(): Promise<WalletEntry[]> {
  const session = await requireSession();

  const entries = await db
    .select()
    .from(walletEntries)
    .where(eq(walletEntries.userId, session.user.id))
    .orderBy(desc(walletEntries.occurredAt));

  if (entries.length === 0) return [];

  const joins = await db
    .select({
      entryId: walletEntryLabels.entryId,
      id: walletLabels.id,
      name: walletLabels.name,
      color: walletLabels.color,
    })
    .from(walletEntryLabels)
    .innerJoin(walletLabels, eq(walletEntryLabels.labelId, walletLabels.id))
    .where(eq(walletLabels.userId, session.user.id));

  const labelsByEntry = new Map<string, WalletLabel[]>();
  for (const j of joins) {
    const arr = labelsByEntry.get(j.entryId) ?? [];
    arr.push({ id: j.id, name: j.name, color: j.color });
    labelsByEntry.set(j.entryId, arr);
  }

  return entries.map((e) => ({
    id: e.id,
    kind: e.kind as "in" | "out",
    amount: Number(e.amount),
    currency: e.currency,
    place: e.place,
    description: e.description,
    occurredAt: e.occurredAt,
    labels: labelsByEntry.get(e.id) ?? [],
  }));
}
