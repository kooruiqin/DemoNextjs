import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { spinRecords } from "@/db/schema/spin";
import { requireSession } from "@/lib/session";
import type { SpinRecord } from "@/lib/mock/daily";

export async function listRecentSpins(limit = 12): Promise<SpinRecord[]> {
  const session = await requireSession();

  const rows = await db
    .select({
      id: spinRecords.id,
      mealType: spinRecords.mealType,
      optionName: spinRecords.optionName,
      accepted: spinRecords.accepted,
      createdAt: spinRecords.createdAt,
    })
    .from(spinRecords)
    .where(eq(spinRecords.userId, session.user.id))
    .orderBy(desc(spinRecords.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    mealType: r.mealType as "lunch" | "dinner",
    optionName: r.optionName,
    accepted: r.accepted,
    createdAt: r.createdAt,
  }));
}
