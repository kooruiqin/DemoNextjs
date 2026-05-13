"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/examples/mock-data";

const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

function sum(rows: Product[], key: "price" | "stock"): number {
  return rows.reduce((acc, r) => acc + (r[key] ?? 0), 0);
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    footer: "Totals",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "category", header: "Category" },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <span className="tabular-nums">${row.original.price.toFixed(2)}</span>,
    footer: ({ table }) => {
      const rows = table.getCoreRowModel().rows.map((r) => r.original);
      const avg = rows.length ? sum(rows, "price") / rows.length : 0;
      return <span className="tabular-nums">avg ${avg.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    footer: ({ table }) => {
      const rows = table.getCoreRowModel().rows.map((r) => r.original);
      return <span className="tabular-nums">{sum(rows, "stock")}</span>;
    },
  },
  {
    id: "value",
    header: "Inventory value",
    cell: ({ row }) => (
      <span className="tabular-nums">
        ${(row.original.price * row.original.stock).toFixed(2)}
      </span>
    ),
    footer: ({ table }) => {
      const rows = table.getCoreRowModel().rows.map((r) => r.original);
      const total = rows.reduce((acc, r) => acc + r.price * r.stock, 0);
      return <span className="tabular-nums font-medium">${total.toFixed(2)}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>
    ),
  },
];
