import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { StickyHeaderDataTable } from "./data-table";

const TRIPLED = [
  ...MOCK_PRODUCTS,
  ...MOCK_PRODUCTS.map((p) => ({ ...p, id: `${p.id}_b`, sku: `${p.sku}-B` })),
  ...MOCK_PRODUCTS.map((p) => ({ ...p, id: `${p.id}_c`, sku: `${p.sku}-C` })),
];

export default function StickyHeaderTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Sticky header</h1>
        <p className="text-sm text-muted-foreground">
          Table header stays fixed while the body scrolls. {TRIPLED.length} rows.
        </p>
      </div>
      <StickyHeaderDataTable data={TRIPLED} />
    </div>
  );
}
