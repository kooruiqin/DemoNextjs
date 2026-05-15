"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  createTodo,
  updateTodoAction,
  toggleTodo,
  deleteTodo,
  loadTodosForMonthAction,
} from "@/server/actions/todo";
import type { TodoDTO } from "@/server/queries/todo";
import type { CreateTodoInput } from "@/lib/schemas/todo";
import { TodoCalendar } from "./todo-calendar";
import { TodoDayList } from "./todo-day-list";
import { TodoFormSheet } from "./todo-form";
import { compareTodos, dateToYMD, ymdToDate } from "./todo-utils";

type Props = {
  initialYear: number;
  initialMonth: number;
  initialTodos: TodoDTO[];
};

export function TodoShell({ initialYear, initialMonth, initialTodos }: Props) {
  const [month, setMonth] = React.useState<Date>(
    () => new Date(initialYear, initialMonth - 1, 1),
  );
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    const today = new Date();
    return today.getFullYear() === initialYear &&
      today.getMonth() + 1 === initialMonth
      ? today
      : new Date(initialYear, initialMonth - 1, 1);
  });
  const [todos, setTodos] = React.useState<TodoDTO[]>(initialTodos);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TodoDTO | null>(null);
  const lastLoadedRef = React.useRef(`${initialYear}-${initialMonth}`);

  const handleMonthChange = React.useCallback(async (next: Date) => {
    setMonth(next);
    const key = `${next.getFullYear()}-${next.getMonth() + 1}`;
    if (lastLoadedRef.current === key) return;
    lastLoadedRef.current = key;

    const res = await loadTodosForMonthAction({
      year: next.getFullYear(),
      month: next.getMonth() + 1,
    });
    if (res.error || !res.data) {
      toast.error(res.error ?? "Failed to load to-dos");
      return;
    }
    setTodos(res.data);
  }, []);

  const todosForSelectedDay = React.useMemo(() => {
    const key = dateToYMD(selectedDate);
    return todos.filter((t) => t.eventDate === key).sort(compareTodos);
  }, [todos, selectedDate]);

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(t: TodoDTO) {
    setEditing(t);
    setSheetOpen(true);
  }

  async function handleSubmit(
    values: CreateTodoInput,
    editingId: string | null,
  ): Promise<{ ok: boolean }> {
    if (editingId) {
      const res = await updateTodoAction({ ...values, id: editingId });
      if (res.error || !res.data) {
        toast.error(res.error ?? "Failed to save");
        return { ok: false };
      }
      const saved = res.data;
      setTodos((prev) => mergeTodo(prev, saved, month));
      setSelectedDate(ymdToDate(saved.eventDate));
      toast.success("To-do updated");
      return { ok: true };
    }
    const res = await createTodo(values);
    if (res.error || !res.data) {
      toast.error(res.error ?? "Failed to save");
      return { ok: false };
    }
    const saved = res.data;
    setTodos((prev) => mergeTodo(prev, saved, month));
    setSelectedDate(ymdToDate(saved.eventDate));
    toast.success("To-do added");
    return { ok: true };
  }

  async function handleToggle(t: TodoDTO, completed: boolean) {
    const previous = todos;
    setTodos((prev) =>
      prev.map((r) =>
        r.id === t.id
          ? { ...r, completed, completedAt: completed ? new Date() : null }
          : r,
      ),
    );
    const res = await toggleTodo({ id: t.id, completed });
    if (res.error) {
      setTodos(previous);
      toast.error(res.error);
    }
  }

  async function handleDelete(t: TodoDTO) {
    const previous = todos;
    setTodos((prev) => prev.filter((r) => r.id !== t.id));
    const res = await deleteTodo({ id: t.id });
    if (res.error) {
      setTodos(previous);
      toast.error(res.error);
      return;
    }
    toast.success("To-do deleted");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <div className="flex justify-center lg:justify-start">
        <TodoCalendar
          month={month}
          selected={selectedDate}
          todos={todos}
          onSelect={setSelectedDate}
          onMonthChange={handleMonthChange}
        />
      </div>
      <TodoDayList
        date={selectedDate}
        todos={todosForSelectedDay}
        onAdd={openCreate}
        onEdit={openEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
      <TodoFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialDate={dateToYMD(selectedDate)}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function mergeTodo(prev: TodoDTO[], saved: TodoDTO, currentMonth: Date): TodoDTO[] {
  const savedDate = ymdToDate(saved.eventDate);
  const inView =
    savedDate.getFullYear() === currentMonth.getFullYear() &&
    savedDate.getMonth() === currentMonth.getMonth();

  const without = prev.filter((r) => r.id !== saved.id);
  if (!inView) return without;
  return [...without, saved];
}
