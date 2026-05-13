import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { FilterDataTable } from "./data-table";

export default function FilterTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Filter table</h1>
        <p className="text-sm text-muted-foreground">
          {MOCK_PRODUCTS.length} mock products. Search, filter by category, sort
          columns, and toggle visibility.
        </p>
      </div>
      <FilterDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
