import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { ReorderDataTable } from "./data-table";

export default function ReorderTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Reorder rows</h1>
        <p className="text-sm text-muted-foreground">
          Drag a row by its handle to reorder. Built with @dnd-kit/react v0.4.
        </p>
      </div>
      <ReorderDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
