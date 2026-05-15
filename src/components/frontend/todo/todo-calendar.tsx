"use client";

import * as React from "react";

import { Calendar } from "@/components/ui/calendar";
import type { TodoDTO } from "@/server/queries/todo";
import { ymdToDate } from "./todo-utils";

type Props = {
  month: Date;
  selected: Date;
  todos: TodoDTO[];
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
};

export function TodoCalendar({
  month,
  selected,
  todos,
  onSelect,
  onMonthChange,
}: Props) {
  const { withTodo, withDone } = React.useMemo(() => {
    const open = new Map<string, Date>();
    const done = new Map<string, Date>();
    for (const t of todos) {
      const d = ymdToDate(t.eventDate);
      const key = t.eventDate;
      if (t.completed) {
        if (!open.has(key)) done.set(key, d);
      } else {
        done.delete(key);
        open.set(key, d);
      }
    }
    return {
      withTodo: Array.from(open.values()),
      withDone: Array.from(done.values()),
    };
  }, [todos]);

  return (
    <Calendar
      mode="single"
      month={month}
      onMonthChange={onMonthChange}
      selected={selected}
      onSelect={(d) => {
        if (d) onSelect(d);
      }}
      modifiers={{ withTodo, withDone }}
      modifiersClassNames={{
        withTodo:
          "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
        withDone:
          "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-muted-foreground/50",
      }}
      className="rounded-xl border bg-card/40 p-3 shadow-sm"
    />
  );
}
