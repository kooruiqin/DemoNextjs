"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowDownRight,
  ArrowUpRight,
  Filter as FilterIcon,
  Plus,
  Wallet as WalletIcon,
  Calendar,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const entrySchema = z.object({
  kind: z.enum(["in", "out"]),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  place: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(280).optional().or(z.literal("")),
  occurredAt: z.string().min(1, "Date is required"),
  labelIds: z.array(z.string()),
});
type EntryInput = z.infer<typeof entrySchema>;

type Props = {
  entries: WalletEntry[];
  labels: WalletLabel[];
};

type KindFilter = "all" | WalletKind;

export function WalletModule({ entries: initialEntries, labels }: Props) {
  const [entries, setEntries] = React.useState<WalletEntry[]>(initialEntries);
  const [kindFilter, setKindFilter] = React.useState<KindFilter>("all");
  const [activeLabels, setActiveLabels] = React.useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    return entries
      .filter((e) => kindFilter === "all" || e.kind === kindFilter)
      .filter((e) =>
        activeLabels.size === 0 ? true : e.labels.some((l) => activeLabels.has(l.id)),
      )
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }, [entries, kindFilter, activeLabels]);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEntries = entries.filter((e) => e.occurredAt >= monthStart);
  const totals = React.useMemo(() => {
    const inSum = monthEntries.filter((e) => e.kind === "in").reduce((s, e) => s + e.amount, 0);
    const outSum = monthEntries.filter((e) => e.kind === "out").reduce((s, e) => s + e.amount, 0);
    return { in: inSum, out: outSum, net: inSum - outSum };
  }, [monthEntries]);

  function toggleLabel(id: string) {
    setActiveLabels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addEntry(input: EntryInput) {
    const labelObjs = input.labelIds
      .map((id) => labels.find((l) => l.id === id))
      .filter((l): l is WalletLabel => Boolean(l));
    const newEntry: WalletEntry = {
      id: `local-${Date.now()}`,
      kind: input.kind,
      amount: Number(input.amount),
      currency: "MYR",
      place: input.place?.trim() || null,
      description: input.description?.trim() || null,
      occurredAt: new Date(input.occurredAt),
      labels: labelObjs,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="In this month"
          value={formatMoney(totals.in)}
          icon={<ArrowDownRight className="size-4 text-emerald-600" />}
          tone="emerald"
        />
        <SummaryCard
          label="Out this month"
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="size-4" />
                  Add entry
                </Button>
              </DialogTrigger>
              <EntryDialog labels={labels} onSubmit={addEntry} />
            </Dialog>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <FilterIcon className="size-3" />
              Labels
            </span>
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
              No entries match these filters.
            </div>
          ) : (
            <ul className="divide-y divide-border/70">
              {filtered.map((e) => (
                <EntryRow key={e.id} entry={e} />
              ))}
            </ul>
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

function EntryRow({ entry }: { entry: WalletEntry }) {
  const isIn = entry.kind === "in";
  return (
    <li className="flex items-center gap-4 py-3">
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
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3" />
            {entry.occurredAt.toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
          </span>
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
    </li>
  );
}

function EntryDialog({
  labels,
  onSubmit,
}: {
  labels: WalletLabel[];
  onSubmit: (input: EntryInput) => void;
}) {
  const todayStr = React.useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const form = useForm<EntryInput>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      kind: "out",
      amount: "",
      place: "",
      description: "",
      occurredAt: todayStr,
      labelIds: [],
    },
  });

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New entry</DialogTitle>
        <DialogDescription>Record money going in or out.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => {
            onSubmit(v);
            form.reset();
          })}
          className="space-y-4"
        >
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
                    <Input
                      inputMode="decimal"
                      placeholder="0.00"
                      {...field}
                    />
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
                  <Input placeholder="e.g. Hawker centre, Grab, Acme Bhd" {...field} />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              Save entry
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
