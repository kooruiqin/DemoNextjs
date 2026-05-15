"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createTodoSchema, type CreateTodoInput } from "@/lib/schemas/todo";
import type { TodoDTO } from "@/server/queries/todo";
import { dateToYMD, ymdToDate } from "./todo-utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: string;
  editing: TodoDTO | null;
  onSubmit: (
    values: CreateTodoInput,
    editingId: string | null,
  ) => Promise<{ ok: boolean }>;
};

function defaultValues(
  initialDate: string,
  editing: TodoDTO | null,
): CreateTodoInput {
  if (editing) {
    return {
      title: editing.title,
      eventDate: editing.eventDate,
      eventTime: editing.eventTime ?? "",
      priority: editing.priority,
      label: editing.label ?? "",
      notes: editing.notes ?? "",
    };
  }
  return {
    title: "",
    eventDate: initialDate,
    eventTime: "",
    priority: "normal",
    label: "",
    notes: "",
  };
}

export function TodoFormSheet({
  open,
  onOpenChange,
  initialDate,
  editing,
  onSubmit,
}: Props) {
  const form = useForm<CreateTodoInput>({
    resolver: zodResolver(createTodoSchema),
    defaultValues: defaultValues(initialDate, editing),
  });

  React.useEffect(() => {
    if (open) form.reset(defaultValues(initialDate, editing));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing, initialDate]);

  async function handleSubmit(values: CreateTodoInput) {
    const cleaned: CreateTodoInput = {
      ...values,
      eventTime: values.eventTime ? values.eventTime : null,
      label: values.label && values.label.trim() ? values.label.trim() : null,
      notes: values.notes && values.notes.trim() ? values.notes.trim() : null,
    };
    const res = await onSubmit(cleaned, editing?.id ?? null);
    if (res.ok) onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit to-do" : "New to-do"}</SheetTitle>
          <SheetDescription>
            {editing
              ? "Update the details for this to-do."
              : "Add a task to your calendar with optional notes and time."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder="What needs doing?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-[1fr_120px] gap-3">
                <FormField
                  control={form.control}
                  name="eventDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "justify-start gap-2 font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="size-4 opacity-70" />
                              {field.value
                                ? formatLongDate(ymdToDate(field.value))
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? ymdToDate(field.value) : undefined
                            }
                            onSelect={(d) => {
                              if (d) field.onChange(dateToYMD(d));
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eventTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. errand"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any details..."
                        rows={5}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Create to-do"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

const FULL_WEEKDAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const FULL_MONTH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatLongDate(d: Date): string {
  return `${FULL_WEEKDAY[d.getDay()].slice(0, 3)}, ${FULL_MONTH[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}
