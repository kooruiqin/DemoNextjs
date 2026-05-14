"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter as FilterIcon,
  Plus,
  Wallet as WalletIcon,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  formatMoney,
  type WalletEntry,
  type WalletKind,
  type WalletLabel,
} from "@/lib/mock/daily";
import {
  createWalletEntrySchema,
  type CreateWalletEntryInput,
} from "@/lib/schemas/wallet";
import {
  createWalletEntry,
  createWalletLabel,
  deleteWalletEntry,
} from "@/server/actions/wallet";

type Props = {
  entries: WalletEntry[];
  labels: WalletLabel[];
};

type KindFilter = "all" | WalletKind;
type ViewMode = "week" | "month" | "custom";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d: Date): Date {
  const x = startOfDay(d);
  const day = x.getDay();
  const shift = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + shift);
  return x;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseDateInput(s: string): Date {
  return new Date(`${s}T00:00:00`);
}
function formatDayHeading(d: Date, today: Date): string {
  const diffDays = Math.round((d.getTime() - today.getTime()) / 86400000);
  const weekday = d.toLocaleDateString("en-MY", { weekday: "long" });
  const dm = d.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
  if (diffDays === 0) return `Today · ${weekday}, ${dm}`;
  if (diffDays === -1) return `Yesterday · ${weekday}, ${dm}`;
  return `${weekday}, ${dm}`;
}

function formatPeriodLabel(mode: ViewMode, from: Date, toExclusive: Date): string {
  const last = addDays(toExclusive, -1);
  const sameYear = from.getFullYear() === last.getFullYear();
  const yearSuffix = sameYear ? "" : `, ${last.getFullYear()}`;
  if (mode === "month") {
    return from.toLocaleDateString("en-MY", { month: "long", year: "numeric" });
  }
  if (
    from.getFullYear() === last.getFullYear() &&
    from.getMonth() === last.getMonth()
  ) {
    return `${from.toLocaleDateString("en-MY", { month: "short", day: "numeric" })} – ${last.getDate()}${yearSuffix}`;
  }
  return `${from.toLocaleDateString("en-MY", { month: "short", day: "numeric" })} – ${last.toLocaleDateString("en-MY", { month: "short", day: "numeric" })}${yearSuffix}`;
}

const LABEL_PALETTE = [
  "#f97316",
  "#3b82f6",
  "#10b981",
  "#8b5cf6",
  "#a16207",
  "#ec4899",
  "#0ea5e9",
  "#ef4444",
];

export function WalletModule({ entries, labels }: Props) {
  const router = useRouter();
  const [kindFilter, setKindFilter] = React.useState<KindFilter>("all");
  const [activeLabels, setActiveLabels] = React.useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const [viewMode, setViewMode] = React.useState<ViewMode>("month");
  const [anchor, setAnchor] = React.useState<Date>(() => startOfDay(new Date()));
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const [customStart, setCustomStart] = React.useState<string>(() =>
    toDateInputValue(addDays(today, -6)),
  );
  const [customEnd, setCustomEnd] = React.useState<string>(() => toDateInputValue(today));

  const period = React.useMemo<{ from: Date; to: Date }>(() => {
    if (viewMode === "week") {
      const from = startOfWeek(anchor);
      return { from, to: addDays(from, 7) };
    }
    if (viewMode === "month") {
      const from = startOfMonth(anchor);
      return { from, to: addMonths(from, 1) };
    }
    const startStr = customStart;
    const endStr = customEnd && customEnd >= customStart ? customEnd : customStart;
    const from = parseDateInput(startStr);
    const to = addDays(parseDateInput(endStr), 1);
    return { from, to };
  }, [viewMode, anchor, customStart, customEnd]);

  function shiftPeriod(direction: -1 | 1) {
    if (viewMode === "week") setAnchor((a) => addDays(a, 7 * direction));
    else if (viewMode === "month") setAnchor((a) => addMonths(a, direction));
  }

  function jumpToToday() {
    setAnchor(today);
    if (viewMode === "custom") {
      setCustomStart(toDateInputValue(addDays(today, -6)));
      setCustomEnd(toDateInputValue(today));
    }
  }

  React.useEffect(() => {
    if (entries.length === 0 && editMode) setEditMode(false);
  }, [entries.length, editMode]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteWalletEntry(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Entry deleted");
    router.refresh();
  }

  const inPeriod = React.useMemo(
    () =>
      entries.filter((e) => e.occurredAt >= period.from && e.occurredAt < period.to),
    [entries, period.from, period.to],
  );

  const filtered = React.useMemo(() => {
    return inPeriod
      .filter((e) => kindFilter === "all" || e.kind === kindFilter)
      .filter((e) =>
        activeLabels.size === 0 ? true : e.labels.some((l) => activeLabels.has(l.id)),
      );
  }, [inPeriod, kindFilter, activeLabels]);

  const groupedByDay = React.useMemo(() => {
    const map = new Map<string, { date: Date; items: WalletEntry[] }>();
    for (const e of filtered) {
      const d = startOfDay(e.occurredAt);
      const key = toDateInputValue(d);
      const existing = map.get(key);
      if (existing) existing.items.push(e);
      else map.set(key, { date: d, items: [e] });
    }
    return Array.from(map.entries()).map(([key, v]) => {
      const inSum = v.items.filter((e) => e.kind === "in").reduce((s, e) => s + e.amount, 0);
      const outSum = v.items.filter((e) => e.kind === "out").reduce((s, e) => s + e.amount, 0);
      return { key, date: v.date, items: v.items, net: inSum - outSum };
    });
  }, [filtered]);

  const totals = React.useMemo(() => {
    const inSum = inPeriod.filter((e) => e.kind === "in").reduce((s, e) => s + e.amount, 0);
    const outSum = inPeriod.filter((e) => e.kind === "out").reduce((s, e) => s + e.amount, 0);
    return { in: inSum, out: outSum, net: inSum - outSum };
  }, [inPeriod]);

  const periodLabel = formatPeriodLabel(viewMode, period.from, period.to);
  const summaryNoun =
    viewMode === "week" ? "this period" : viewMode === "month" ? "this month" : "this range";

  function toggleLabel(id: string) {
    setActiveLabels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label={`In ${summaryNoun}`}
          value={formatMoney(totals.in)}
          icon={<ArrowDownRight className="size-4 text-emerald-600" />}
          tone="emerald"
        />
        <SummaryCard
          label={`Out ${summaryNoun}`}
          value={formatMoney(totals.out)}
          icon={<ArrowUpRight className="size-4 text-rose-600" />}
          tone="rose"
        />
        <SummaryCard
          label="Net"
          value={formatMoney(totals.net)}
          icon={<WalletIcon className="size-4" />}
          tone={totals.net >= 0 ? "emerald" : "rose"}
          emphasized
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>

            {viewMode === "custom" ? (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="h-8 w-[10.5rem] text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="h-8 w-[10.5rem] text-xs"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => shiftPeriod(-1)}
                  aria-label={`Previous ${viewMode}`}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="min-w-[10rem] text-center text-sm font-medium tabular-nums">
                  {periodLabel}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => shiftPeriod(1)}
                  aria-label={`Next ${viewMode}`}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-8 text-xs"
                  onClick={jumpToToday}
                >
                  Today
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Tabs value={kindFilter} onValueChange={(v) => setKindFilter(v as KindFilter)}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="in">In</TabsTrigger>
                  <TabsTrigger value="out">Out</TabsTrigger>
                </TabsList>
              </Tabs>
              <span className="text-xs text-muted-foreground">
                {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label
                className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium select-none",
                  entries.length === 0 && "pointer-events-none opacity-50",
                  editMode ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Pencil className="size-3" />
                Edit
                <Switch
                  size="sm"
                  checked={editMode}
                  disabled={entries.length === 0}
                  onCheckedChange={setEditMode}
                />
              </label>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="size-4" />
                    Add entry
                  </Button>
                </DialogTrigger>
                <EntryDialog
                  labels={labels}
                  onSaved={() => {
                    setDialogOpen(false);
                    router.refresh();
                  }}
                  onLabelCreated={() => router.refresh()}
                />
              </Dialog>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <FilterIcon className="size-3" />
              Labels
            </span>
            {labels.length === 0 && (
              <span className="text-xs text-muted-foreground">
                None yet — add one from the entry form.
              </span>
            )}
            {labels.map((l) => {
              const active = activeLabels.has(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => toggleLabel(l.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    active
                      ? "border-transparent text-white"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                  style={active ? { backgroundColor: l.color } : undefined}
                >
                  <span
                    className={cn("size-1.5 rounded-full", active ? "bg-white/80" : "")}
                    style={!active ? { backgroundColor: l.color } : undefined}
                  />
                  {l.name}
                </button>
              );
            })}
            {activeLabels.size > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() => setActiveLabels(new Set())}
              >
                Clear
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {entries.length === 0
                ? "No entries yet. Add your first one."
                : inPeriod.length === 0
                  ? "No entries in this period."
                  : "No entries match these filters."}
            </div>
          ) : (
            <div className="space-y-4">
              {groupedByDay.map((group) => (
                <section key={group.key}>
                  <div className="mb-1 flex items-baseline justify-between gap-2 border-b border-border/60 pb-1.5">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground/80">
                      {formatDayHeading(group.date, today)}
                    </h3>
                    <span
                      className={cn(
                        "text-xs font-medium tabular-nums",
                        group.net > 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : group.net < 0
                            ? "text-rose-700 dark:text-rose-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {group.net > 0 ? "+" : group.net < 0 ? "−" : ""}
                      {formatMoney(Math.abs(group.net))}
                    </span>
                  </div>
                  <ul className="divide-y divide-border/70">
                    {group.items.map((e) => (
                      <EntryRow
                        key={e.id}
                        entry={e}
                        editMode={editMode}
                        deleting={deletingId === e.id}
                        onDelete={() => handleDelete(e.id)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
  emphasized = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "emerald" | "rose";
  emphasized?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        emphasized
          ? tone === "emerald"
            ? "border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900/30 dark:from-emerald-950/40 dark:to-teal-950/30"
            : "border-rose-200/60 bg-gradient-to-br from-rose-50 to-orange-50 dark:border-rose-900/30 dark:from-rose-950/40 dark:to-orange-950/30"
          : "",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <p
          className={cn(
            "mt-1 text-2xl font-semibold tabular-nums tracking-tight md:text-3xl",
            emphasized && tone === "emerald" && "text-emerald-700 dark:text-emerald-400",
            emphasized && tone === "rose" && "text-rose-700 dark:text-rose-400",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function EntryRow({
  entry,
  editMode,
  deleting,
  onDelete,
}: {
  entry: WalletEntry;
  editMode: boolean;
  deleting: boolean;
  onDelete: () => void;
}) {
  const isIn = entry.kind === "in";
  return (
    <li className={cn("flex items-center gap-4 py-3", deleting && "opacity-50")}>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          isIn
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
        )}
      >
        {isIn ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {entry.description ?? entry.place ?? (isIn ? "Income" : "Expense")}
          </p>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {entry.place && <span>{entry.place}</span>}
          {entry.labels.map((l) => (
            <Badge
              key={l.id}
              variant="outline"
              className="gap-1 border-transparent px-1.5 py-0 text-[10px] font-medium"
              style={{ backgroundColor: `${l.color}1a`, color: l.color }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.name}
            </Badge>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 text-right tabular-nums",
          isIn ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
        )}
      >
        <p className="text-base font-semibold">
          {isIn ? "+" : "−"}
          {formatMoney(entry.amount)}
        </p>
      </div>

      {editMode && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Delete entry"
              disabled={deleting}
              className="size-8 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"
            >
              <Trash2 className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
              <AlertDialogDescription>
                {entry.description ?? entry.place ?? (isIn ? "Income" : "Expense")} —{" "}
                {formatMoney(entry.amount)}. This can&apos;t be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
  );
}

function EntryDialog({
  labels,
  onSaved,
  onLabelCreated,
}: {
  labels: WalletLabel[];
  onSaved: () => void;
  onLabelCreated: () => void;
}) {
  const todayStr = React.useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const form = useForm<CreateWalletEntryInput>({
    resolver: zodResolver(createWalletEntrySchema),
    defaultValues: {
      kind: "out",
      amount: "",
      place: "",
      description: "",
      occurredAt: todayStr,
      labelIds: [],
    },
  });

  async function onSubmit(values: CreateWalletEntryInput) {
    const result = await createWalletEntry(values);
    if (result.error) {
      form.setError("root", { message: result.error });
      toast.error(result.error);
      return;
    }
    toast.success("Entry saved");
    form.reset({
      kind: "out",
      amount: "",
      place: "",
      description: "",
      occurredAt: todayStr,
      labelIds: [],
    });
    onSaved();
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New entry</DialogTitle>
        <DialogDescription>Record money going in or out.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange("out")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                        field.value === "out"
                          ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
                          : "hover:bg-muted",
                      )}
                    >
                      <ArrowUpRight className="size-4" />
                      Out
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange("in")}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                        field.value === "in"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
                          : "hover:bg-muted",
                      )}
                    >
                      <ArrowDownRight className="size-4" />
                      In
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input inputMode="decimal" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occurredAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="place"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Where</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Hawker centre, Grab, Acme Bhd"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What</FormLabel>
                <FormControl>
                  <Textarea
                    rows={2}
                    placeholder="Optional note"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="labelIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Labels</FormLabel>
                <div className="flex flex-wrap gap-1.5">
                  {labels.map((l) => {
                    const active = field.value.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => {
                          if (active) field.onChange(field.value.filter((id) => id !== l.id));
                          else field.onChange([...field.value, l.id]);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                          active
                            ? "border-transparent text-white"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                        style={active ? { backgroundColor: l.color } : undefined}
                      >
                        <span
                          className={cn("size-1.5 rounded-full", active ? "bg-white/80" : "")}
                          style={!active ? { backgroundColor: l.color } : undefined}
                        />
                        {l.name}
                      </button>
                    );
                  })}
                </div>
                <NewLabelInput
                  existingCount={labels.length}
                  onCreated={(created) => {
                    field.onChange([...field.value, created.id]);
                    onLabelCreated();
                  }}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root?.message && (
            <p className="text-sm text-rose-600">{form.formState.errors.root.message}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save entry"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

function NewLabelInput({
  existingCount,
  onCreated,
}: {
  existingCount: number;
  onCreated: (label: { id: string; name: string; color: string }) => void;
}) {
  const [name, setName] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    const color = LABEL_PALETTE[existingCount % LABEL_PALETTE.length] ?? "#94a3b8";
    const result = await createWalletLabel({ name: trimmed, color });
    setSubmitting(false);
    if (result.error || !result.data) {
      toast.error(result.error ?? "Failed to create label");
      return;
    }
    setName("");
    onCreated(result.data);
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New label name"
        className="h-8 text-xs"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8"
        disabled={submitting || name.trim().length === 0}
        onClick={submit}
      >
        Add
      </Button>
    </div>
  );
}
