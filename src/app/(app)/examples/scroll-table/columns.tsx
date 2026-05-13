"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/examples/mock-data";

const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "supplier", header: "Supplier" },
  { accessorKey: "color", header: "Color" },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <span className="tabular-nums">${row.original.price.toFixed(2)}</span>,
  },
  {
    accessorKey: "marginPct",
    header: "Margin",
    cell: ({ row }) =>
      row.original.marginPct !== undefined
        ? `${(row.original.marginPct * 100).toFixed(0)}%`
        : "—",
  },
  { accessorKey: "stock", header: "Stock" },
  {
    accessorKey: "weightG",
    header: "Weight",
    cell: ({ row }) => (row.original.weightG ? `${row.original.weightG}g` : "—"),
  },
  {
    accessorKey: "leadTimeDays",
    header: "Lead time",
    cell: ({ row }) =>
      row.original.leadTimeDays ? `${row.original.leadTimeDays}d` : "—",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>
    ),
  },
  { accessorKey: "createdAt", header: "Created" },
];
