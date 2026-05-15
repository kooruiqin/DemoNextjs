import { z } from "zod";

export const todoPrioritySchema = z.enum(["low", "normal", "high"]);
export type TodoPriority = z.infer<typeof todoPrioritySchema>;

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

const timeOnly = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Time must be HH:mm");

const titleField = z.string().trim().min(1, "Title is required").max(200);
const notesField = z.string().trim().max(2000).nullable().optional();
const labelField = z.string().trim().max(50).nullable().optional();

export const createTodoSchema = z.object({
  title: titleField,
  eventDate: dateOnly,
  eventTime: timeOnly.nullable().optional(),
  priority: todoPrioritySchema.default("normal"),
  label: labelField,
  notes: notesField,
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = createTodoSchema.extend({
  id: z.string().min(1),
});

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

export const toggleTodoSchema = z.object({
  id: z.string().min(1),
  completed: z.boolean(),
});

export type ToggleTodoInput = z.infer<typeof toggleTodoSchema>;

export const deleteTodoSchema = z.object({
  id: z.string().min(1),
});

export type DeleteTodoInput = z.infer<typeof deleteTodoSchema>;

export const loadMonthSchema = z.object({
  year: z.number().int().min(1970).max(9999),
  month: z.number().int().min(1).max(12),
});

export type LoadMonthInput = z.infer<typeof loadMonthSchema>;
