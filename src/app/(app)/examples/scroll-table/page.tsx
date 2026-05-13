import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { ScrollDataTable } from "./data-table";

export default function ScrollTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Horizontal scroll</h1>
        <p className="text-sm text-muted-foreground">
          Wide table with many columns. The Name column stays pinned to the left
          as you scroll horizontally.
        </p>
      </div>
      <ScrollDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
