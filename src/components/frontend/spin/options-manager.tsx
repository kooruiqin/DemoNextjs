"use client";

import * as React from "react";
import { Plus, Trash2, Utensils } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FoodOption } from "@/lib/mock/daily";

type MealValue = FoodOption["mealType"];

const MEAL_VALUES: MealValue[] = ["lunch", "dinner", "both"];
const MEAL_LABEL: Record<MealValue, string> = {
  lunch: "Lunch",
  dinner: "Dinner",
  both: "Both",
};

type OptionsManagerProps = {
  options: FoodOption[];
  onChange: (next: FoodOption[]) => void;
};

const NAME_MAX = 60;

function makeId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function OptionsManager({ options, onChange }: OptionsManagerProps) {
  const [newName, setNewName] = React.useState("");
  const [newMeal, setNewMeal] = React.useState<MealValue>("both");
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const enabledCount = options.filter((o) => o.enabled).length;

  function addOption() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const next: FoodOption = {
      id: makeId(),
      name: trimmed.slice(0, NAME_MAX),
      mealType: newMeal,
      enabled: true,
      weight: 1,
    };
    onChange([next, ...options]);
    setNewName("");
    nameInputRef.current?.focus();
  }

  function updateOption(id: string, patch: Partial<FoodOption>) {
    onChange(options.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function deleteOption(id: string) {
    onChange(options.filter((o) => o.id !== id));
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="rounded-xl border bg-muted/30 p-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Add a new option
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            ref={nameInputRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value.slice(0, NAME_MAX))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOption();
              }
            }}
            placeholder="e.g. Mee goreng mamak"
            className="flex-1"
          />
          <Select value={newMeal} onValueChange={(v) => setNewMeal(v as MealValue)}>
            <SelectTrigger className="sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEAL_VALUES.map((v) => (
                <SelectItem key={v} value={v}>
                  {MEAL_LABEL[v]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addOption} disabled={!newName.trim()} className="gap-1.5">
            <Plus className="size-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {options.length} option{options.length === 1 ? "" : "s"}
          <span className="mx-1.5 text-muted-foreground/40">·</span>
          <span className="font-medium text-foreground">{enabledCount}</span> enabled
        </span>
      </div>

      {options.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          <Utensils className="size-5 opacity-50" />
          <p>No options yet. Add one above.</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto pr-1">
          {options.map((o) => (
            <li
              key={o.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border bg-card p-2 transition-opacity",
                !o.enabled && "opacity-60",
              )}
            >
              <Input
                value={o.name}
                onChange={(e) => updateOption(o.id, { name: e.target.value.slice(0, NAME_MAX) })}
                className="h-9 flex-1 border-transparent bg-transparent px-2 shadow-none focus-visible:border-input focus-visible:bg-background"
                aria-label="Option name"
              />
              <Select
                value={o.mealType}
                onValueChange={(v) => updateOption(o.id, { mealType: v as MealValue })}
              >
                <SelectTrigger className="h-9 w-24 shrink-0" aria-label="Meal type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEAL_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {MEAL_LABEL[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Switch
                checked={o.enabled}
                onCheckedChange={(checked) => updateOption(o.id, { enabled: checked })}
                aria-label={o.enabled ? "Disable" : "Enable"}
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => deleteOption(o.id)}
                aria-label="Delete option"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
