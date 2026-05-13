import { SpinShell } from "@/components/frontend/spin/spin-shell";
import { MOCK_FOOD_OPTIONS, MOCK_SPIN_RECORDS } from "@/lib/mock/daily";

export default function SpinPage() {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          What to eat?
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Let the wheel decide.</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Pick from your own list, or pull restaurants within 3&nbsp;km of where you are. Mark
          results thumbs-up or thumbs-down to track whether the wheel earns its keep.
        </p>
      </header>

      <SpinShell
        options={MOCK_FOOD_OPTIONS}
        initialMeal="lunch"
        initialRecords={MOCK_SPIN_RECORDS}
      />
    </div>
  );
}
