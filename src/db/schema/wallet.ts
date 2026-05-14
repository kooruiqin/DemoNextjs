import {
  pgTable,
  text,
  timestamp,
  numeric,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth";

export const walletLabels = pgTable(
  "wallet_labels",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("wallet_labels_user_name_uq").on(t.userId, t.name)],
);

export const walletEntries = pgTable(
  "wallet_entries",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["in", "out"] }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("MYR"),
    place: text("place"),
    description: text("description"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("wallet_entries_user_occurred_idx").on(t.userId, t.occurredAt)],
);

export const walletEntryLabels = pgTable(
  "wallet_entry_labels",
  {
    entryId: text("entry_id")
      .notNull()
      .references(() => walletEntries.id, { onDelete: "cascade" }),
    labelId: text("label_id")
      .notNull()
      .references(() => walletLabels.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.entryId, t.labelId] })],
);

export type WalletLabelRow = typeof walletLabels.$inferSelect;
export type NewWalletLabelRow = typeof walletLabels.$inferInsert;
export type WalletEntryRow = typeof walletEntries.$inferSelect;
export type NewWalletEntryRow = typeof walletEntries.$inferInsert;
