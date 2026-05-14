"use client";

import * as React from "react";
import { Settings2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { type FoodOption, type MealType } from "@/lib/mock/daily";
import { WheelView, type WheelOption } from "./wheel-view";
import { OptionsManager } from "./options-manager";

type Props = {
  options: FoodOption[];
  onOptionsChange: (next: FoodOption[]) => void;
  initialMeal: MealType;
  onResult: (entry: { mealType: MealType; optionName: string }) => void;
};

export function SpinFromList({ options, onOptionsChange, initialMeal, onResult }: Props) {
  const [meal, setMeal] = React.useState<MealType>(initialMeal);
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const wheelOptions: WheelOption[] = React.useMemo(
    () =>
      options
        .filter((o) => o.enabled && (o.mealType === meal || o.mealType === "both"))
        .map((o) => ({ id: o.id, label: o.name, weight: o.weight })),
    [options, meal],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={meal} onValueChange={(v) => setMeal(v as MealType)}>
          <TabsList>
            <TabsTrigger value="lunch">Lunch</TabsTrigger>
            <TabsTrigger value="dinner">Dinner</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {wheelOptions.length} option{wheelOptions.length === 1 ? "" : "s"} for {meal}
          </p>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Settings2 className="size-3.5" />
                Manage
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col gap-4 p-6 sm:max-w-md">
              <SheetHeader className="space-y-1 p-0">
                <SheetTitle>Your food options</SheetTitle>
                <SheetDescription>
                  Add, edit, or disable options. The wheel uses only the ones enabled for the
                  current meal.
                </SheetDescription>
              </SheetHeader>
              <div className="min-h-0 flex-1">
                <OptionsManager options={options} onChange={onOptionsChange} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <WheelView
        options={wheelOptions}
        resetKey={`${meal}|${wheelOptions.length}`}
        onResult={(r) => onResult({ mealType: meal, optionName: r.label })}
        emptyState={
          <div className="flex flex-col items-center gap-3">
            <p>
              No {meal} options enabled. Add some or toggle them on in <b>Manage</b>.
            </p>
            <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)} className="gap-1.5">
              <Settings2 className="size-3.5" />
              Manage options
            </Button>
          </div>
        }
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
