"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type FoodOption, type MealType } from "@/lib/mock/daily";
import { WheelView, type WheelOption } from "./wheel-view";

type Props = {
  options: FoodOption[];
  initialMeal: MealType;
  onResult: (entry: { mealType: MealType; optionName: string }) => void;
};

export function SpinFromList({ options, initialMeal, onResult }: Props) {
  const [meal, setMeal] = React.useState<MealType>(initialMeal);

  const wheelOptions: WheelOption[] = React.useMemo(
    () =>
      options
        .filter((o) => o.mealType === meal || o.mealType === "both")
        .map((o) => ({ id: o.id, label: o.name, weight: o.weight })),
    [options, meal],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={meal} onValueChange={(v) => setMeal(v as MealType)}>
          <TabsList>
            <TabsTrigger value="lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner">Dinner</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground">
          {wheelOptions.length} option{wheelOptions.length === 1 ? "" : "s"} for {meal}
        </p>
      </div>

      <WheelView
        options={wheelOptions}
        resetKey={meal}
        onResult={(r) => onResult({ mealType: meal, optionName: r.label })}
        emptyState="Add some options in settings first."
        renderResult={(r) => (
          <div className="flex flex-col items-center gap-2">
            <Badge className="gap-1 bg-foreground px-3 py-1 text-sm">
              <Sparkles className="size-3" />
              {meal}
            </Badge>
            <p className="text-2xl font-semibold tracking-tight">{r.label}</p>
          </div>
        )}
      />
    </div>
  );
}
