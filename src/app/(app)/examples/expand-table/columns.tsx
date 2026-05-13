"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/examples/mock-data";

const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "expand",
    header: () => null,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => row.toggleExpanded()}
        aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
      >
        <ChevronRight
          className={`size-4 transition-transform ${row.getIsExpanded() ? "rotate-90" : ""}`}
        />
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "category", header: "Category" },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <span className="tabular-nums">${row.original.price.toFixed(2)}</span>,
  },
  { accessorKey: "stock", header: "Stock" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>
    ),
  },
];
