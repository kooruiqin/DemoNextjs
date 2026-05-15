"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TodoDTO } from "@/server/queries/todo";
import type { TodoPriority } from "@/lib/schemas/todo";
import { formatTime12 } from "./todo-utils";

type Props = {
  date: Date;
  todos: TodoDTO[];
  onAdd: () => void;
  onEdit: (todo: TodoDTO) => void;
  onToggle: (todo: TodoDTO, completed: boolean) => void;
  onDelete: (todo: TodoDTO) => void;
};

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatHeader(d: Date) {
  return `${WEEKDAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`;
}

const PRIORITY_TONE: Record<
  TodoPriority,
  { label: string; className: string }
> = {
  high: {
    label: "High",
    className:
      "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  },
  normal: {
    label: "Normal",
    className: "border-border bg-muted text-muted-foreground",
  },
  low: {
    label: "Low",
    className:
      "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
};

export function TodoDayList({
  date,
  todos,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}: Props) {
  const [pendingDelete, setPendingDelete] = React.useState<TodoDTO | null>(null);

  return (
    <div className="rounded-xl border bg-card/40 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Selected day
          </p>
          <h2 className="text-lg font-semibold tracking-tight">{formatHeader(date)}</h2>
        </div>
        <Button size="sm" onClick={onAdd} className="gap-1.5">
          <Plus className="size-3.5" />
          Add to-do
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {todos.length === 0 ? (
          <li className="rounded-lg border border-dashed bg-background/40 px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing planned. Click <span className="font-medium">Add to-do</span> to start.
          </li>
        ) : (
          todos.map((t) => {
            const tone = PRIORITY_TONE[t.priority];
            return (
              <li
                key={t.id}
                className={cn(
                  "group flex items-start gap-3 rounded-lg border bg-background/60 px-3 py-2.5 transition-colors hover:bg-background",
                  t.completed && "opacity-60",
                )}
              >
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(v) => onToggle(t, v === true)}
                  className="mt-0.5"
                  aria-label={t.completed ? "Mark incomplete" : "Mark complete"}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <p
                      className={cn(
                        "font-medium",
                        t.completed && "line-through",
                      )}
                    >
                      {t.title}
                    </p>
                    {t.eventTime ? (
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatTime12(t.eventTime)}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">All-day</span>
                    )}
                  </div>
                  {t.notes ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {t.notes}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn("h-5 px-2 text-[10px]", tone.className)}
                    >
                      {tone.label}
                    </Badge>
                    {t.label ? (
                      <Badge
                        variant="outline"
                        className="h-5 px-2 text-[10px] text-muted-foreground"
                      >
                        {t.label}
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 text-muted-foreground"
                      aria-label="To-do actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(t)}>
                      <Pencil className="size-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => setPendingDelete(t)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })
        )}
      </ul>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this to-do?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.title}" will be removed permanently.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
