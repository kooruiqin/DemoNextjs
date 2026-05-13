import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { FooterSummaryDataTable } from "./data-table";

export default function FooterSummaryTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Footer summary</h1>
        <p className="text-sm text-muted-foreground">
          Sticky footer row with totals and averages computed across all rows.
        </p>
      </div>
      <FooterSummaryDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
