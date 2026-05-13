import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth";

/**
 * Example domain table. Delete this when you start your real schema.
 *
 * Pattern to follow for new tables:
 * 1. cuid2 id (text, $defaultFn)
 * 2. createdAt + updatedAt (with $onUpdate)
 * 3. snake_case column names, camelCase TS field names
 * 4. Foreign keys with onDelete: "cascade" (or "set null" if soft)
 */
export const posts = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
