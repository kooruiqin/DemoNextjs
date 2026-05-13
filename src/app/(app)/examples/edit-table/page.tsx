import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { EditDataTable } from "./data-table";

export default function EditTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Inline edit table</h1>
        <p className="text-sm text-muted-foreground">
          Click any cell to edit. Press Enter to commit, Escape to revert. Reset
          restores the original mock data.
        </p>
      </div>
      <EditDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
