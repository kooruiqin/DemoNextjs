"use client";

import * as React from "react";
import { List, MapPin } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  type FoodOption,
  type MealType,
  type SpinRecord,
} from "@/lib/mock/daily";
import { createSpinRecord, markSpinRecord } from "@/server/actions/spin";
import { SpinFromList } from "./spin-from-list";
import { SpinNearby } from "./spin-nearby";
import { RecentSpins } from "./recent-spins";

type Mode = "list" | "nearby";

type Props = {
  initialOptions: FoodOption[];
  initialMeal: MealType;
  initialRecords: SpinRecord[];
};

export function SpinShell({ initialOptions, initialMeal, initialRecords }: Props) {
  const [mode, setMode] = React.useState<Mode>("list");
  const [options, setOptions] = React.useState<FoodOption[]>(initialOptions);
  const [records, setRecords] = React.useState<SpinRecord[]>(initialRecords);

  async function appendResult(entry: {
    mealType: MealType;
    optionName: string;
    optionId?: string;
  }) {
    const tempId = `pending-${Date.now()}`;
    const optimistic: SpinRecord = {
      id: tempId,
      mealType: entry.mealType,
      optionName: entry.optionName,
      accepted: null,
      createdAt: new Date(),
    };
    setRecords((prev) => [optimistic, ...prev].slice(0, 12));

    const res = await createSpinRecord({
      mealType: entry.mealType,
      optionName: entry.optionName,
      optionId: entry.optionId,
    });

    if (res.error || !res.data) {
      setRecords((prev) => prev.filter((r) => r.id !== tempId));
      toast.error(res.error ?? "Failed to save spin");
      return;
    }

    const saved = res.data;
    setRecords((prev) => prev.map((r) => (r.id === tempId ? saved : r)));
  }

  async function markRecord(id: string, accepted: boolean) {
    const previous = records;
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, accepted } : r)));

    if (id.startsWith("pending-")) return;

    const res = await markSpinRecord({ id, accepted });
    if (res.error) {
      setRecords(previous);
      toast.error(res.error);
    }
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Spin mode"
        className="inline-flex rounded-full border bg-background/60 p-1 shadow-sm backdrop-blur"
      >
        <ModeTab
          active={mode === "list"}
          onClick={() => setMode("list")}
          icon={<List className="size-3.5" />}
          label="From my list"
        />
        <ModeTab
          active={mode === "nearby"}
          onClick={() => setMode("nearby")}
          icon={<MapPin className="size-3.5" />}
          label="Near me"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          {mode === "list" ? (
            <SpinFromList
              options={options}
              onOptionsChange={setOptions}
              initialMeal={initialMeal}
              onResult={appendResult}
            />
          ) : (
            <SpinNearby onResult={appendResult} />
          )}
        </div>
        <RecentSpins records={records} onMark={markRecord} />
      </div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-foreground text-background shadow"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
