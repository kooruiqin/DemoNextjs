import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { SelectDataTable } from "./data-table";

export default function SelectTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Row selection</h1>
        <p className="text-sm text-muted-foreground">
          Select rows with the checkbox column. A sticky toolbar appears with
          bulk Archive and Delete actions.
        </p>
      </div>
      <SelectDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
