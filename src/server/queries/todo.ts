import { and, asc, between, eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema/todos";
import { requireSession } from "@/lib/session";
import type { TodoPriority } from "@/lib/schemas/todo";

export type TodoDTO = {
  id: string;
  title: string;
  notes: string | null;
  eventDate: string;
  eventTime: string | null;
  priority: TodoPriority;
  label: string | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function monthRange(year: number, month: number) {
  const first = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const last = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { first, last };
}

export async function listTodosForMonth(
  year: number,
  month: number,
): Promise<TodoDTO[]> {
  const session = await requireSession();
  const { first, last } = monthRange(year, month);

  const rows = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, session.user.id),
        between(todos.eventDate, first, last),
      ),
    )
    .orderBy(asc(todos.eventDate), asc(todos.eventTime), asc(todos.createdAt));

  return rows.map((r) => ({
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
  }));
}
