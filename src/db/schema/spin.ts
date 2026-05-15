import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { user } from "./auth";

export const foodOptions = pgTable(
  "food_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    mealType: text("meal_type", { enum: ["lunch", "dinner", "both"] }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    weight: integer("weight").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("food_options_user_idx").on(t.userId)],
);

export const spinRecords = pgTable(
  "spin_records",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mealType: text("meal_type", { enum: ["lunch", "dinner"] }).notNull(),
    optionId: text("option_id").references(() => foodOptions.id, {
      onDelete: "set null",
    }),
    optionName: text("option_name").notNull(),
    accepted: boolean("accepted"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("spin_records_user_created_idx").on(t.userId, t.createdAt)],
);

export type FoodOptionRow = typeof foodOptions.$inferSelect;
export type NewFoodOptionRow = typeof foodOptions.$inferInsert;
export type SpinRecordRow = typeof spinRecords.$inferSelect;
export type NewSpinRecordRow = typeof spinRecords.$inferInsert;
