import { TodoShell } from "@/components/frontend/todo/todo-shell";
import { listTodosForMonth } from "@/server/queries/todo";

export default async function TodoPage() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const todos = await listTodosForMonth(year, month);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Plan your day
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          To-do calendar.
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Drop tasks onto any date, add notes for context, and check them off as you go.
        </p>
      </header>

      <TodoShell
        initialYear={year}
        initialMonth={month}
        initialTodos={todos}
      />
    </div>
  );
}
