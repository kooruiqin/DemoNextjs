"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema/todos";
import { requireSession } from "@/lib/session";
import {
  createTodoSchema,
  updateTodoSchema,
  toggleTodoSchema,
  deleteTodoSchema,
  loadMonthSchema,
  type TodoPriority,
} from "@/lib/schemas/todo";
import { listTodosForMonth, type TodoDTO } from "@/server/queries/todo";

type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

function rowToDTO(r: typeof todos.$inferSelect): TodoDTO {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes,
    eventDate: r.eventDate,
    eventTime: r.eventTime,
    priority: r.priority as TodoPriority,
    label: r.label,
    completed: r.completed,
    completedAt: r.completedAt,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function createTodo(
  input: unknown,
): Promise<ActionResult<TodoDTO>> {
  const session = await requireSession();

  const parsed = createTodoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [row] = await db
      .insert(todos)
      .values({
        userId: session.user.id,
        title: parsed.data.title,
        notes: parsed.data.notes ?? null,
        eventDate: parsed.data.eventDate,
        eventTime: parsed.data.eventTime ?? null,
        priority: parsed.data.priority,
        label: parsed.data.label ?? null,
      })
      .returning();

    revalidatePath("/todo");
    return { data: rowToDTO(row) };
  } catch (e) {
    console.error("createTodo failed:", e);
    return { error: "Failed to create to-do" };
  }
}

export async function updateTodoAction(
  input: unknown,
): Promise<ActionResult<TodoDTO>> {
  const session = await requireSession();

  const parsed = updateTodoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [row] = await db
      .update(todos)
      .set({
        title: parsed.data.title,
        notes: parsed.data.notes ?? null,
        eventDate: parsed.data.eventDate,
        eventTime: parsed.data.eventTime ?? null,
        priority: parsed.data.priority,
        label: parsed.data.label ?? null,
      })
      .where(
        and(eq(todos.id, parsed.data.id), eq(todos.userId, session.user.id)),
      )
      .returning();

    if (!row) return { error: "To-do not found" };

    revalidatePath("/todo");
    return { data: rowToDTO(row) };
  } catch (e) {
    console.error("updateTodoAction failed:", e);
    return { error: "Failed to update to-do" };
  }
}

export async function toggleTodo(
  input: unknown,
): Promise<ActionResult<TodoDTO>> {
  const session = await requireSession();

  const parsed = toggleTodoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [row] = await db
      .update(todos)
      .set({
        completed: parsed.data.completed,
        completedAt: parsed.data.completed ? new Date() : null,
      })
      .where(
        and(eq(todos.id, parsed.data.id), eq(todos.userId, session.user.id)),
      )
      .returning();

    if (!row) return { error: "To-do not found" };

    revalidatePath("/todo");
    return { data: rowToDTO(row) };
  } catch (e) {
    console.error("toggleTodo failed:", e);
    return { error: "Failed to update to-do" };
  }
}

export async function deleteTodo(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();

  const parsed = deleteTodoSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [row] = await db
      .delete(todos)
      .where(
        and(eq(todos.id, parsed.data.id), eq(todos.userId, session.user.id)),
      )
      .returning({ id: todos.id });

    if (!row) return { error: "To-do not found" };

    revalidatePath("/todo");
    return { data: { id: row.id } };
  } catch (e) {
    console.error("deleteTodo failed:", e);
    return { error: "Failed to delete to-do" };
  }
}

export async function loadTodosForMonthAction(
  input: unknown,
): Promise<ActionResult<TodoDTO[]>> {
  const parsed = loadMonthSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const data = await listTodosForMonth(parsed.data.year, parsed.data.month);
    return { data };
  } catch (e) {
    console.error("loadTodosForMonthAction failed:", e);
    return { error: "Failed to load to-dos" };
  }
}
