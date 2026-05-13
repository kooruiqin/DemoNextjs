"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORIES, type Product } from "@/lib/examples/mock-data";
import { EditableCell } from "./data-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateRow?: (id: string, patch: Partial<Product>) => void;
  }
}

const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row, table }) => (
      <EditableCell
        kind="text"
        value={row.original.name}
        onCommit={(v) => table.options.meta?.updateRow?.(row.original.id, { name: String(v) })}
      />
    ),
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.sku}</span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row, table }) => (
      <EditableCell
        kind="select"
        value={row.original.category}
        options={PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c }))}
        onCommit={(v) =>
          table.options.meta?.updateRow?.(row.original.id, {
            category: v as Product["category"],
          })
        }
      />
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row, table }) => (
      <EditableCell
        kind="number"
        value={row.original.price}
        format={(n) => `$${Number(n).toFixed(2)}`}
        onCommit={(v) =>
          table.options.meta?.updateRow?.(row.original.id, { price: Number(v) })
        }
      />
    ),
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row, table }) => (
      <EditableCell
        kind="number"
        value={row.original.stock}
        onCommit={(v) =>
          table.options.meta?.updateRow?.(row.original.id, { stock: Number(v) })
        }
      />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => (
      <EditableCell
        kind="select"
        value={row.original.status}
        options={[
          { label: "active", value: "active" },
          { label: "draft", value: "draft" },
          { label: "archived", value: "archived" },
        ]}
        renderDisplay={(v) => (
          <Badge variant={STATUS_VARIANT[v as Product["status"]]}>{String(v)}</Badge>
        )}
        onCommit={(v) =>
          table.options.meta?.updateRow?.(row.original.id, {
            status: v as Product["status"],
          })
        }
      />
    ),
  },
];
