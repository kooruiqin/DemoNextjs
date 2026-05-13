import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { ExpandDataTable } from "./data-table";

export default function ExpandTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Expandable rows</h1>
        <p className="text-sm text-muted-foreground">
          Click the chevron to expand a row and see secondary detail.
        </p>
      </div>
      <ExpandDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
