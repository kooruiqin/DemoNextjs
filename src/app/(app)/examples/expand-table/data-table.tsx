"use client";

import { Fragment, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  type ExpandedState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/lib/examples/mock-data";
import { columns } from "./columns";

type Props = { data: Product[] };

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function ExpandDataTable({ data }: Props) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: (row) => row.id,
  });

  return (
    <div className="rounded-md border">
      <Table containerClassName="max-h-[480px]">
        <TableHeader className="sticky top-0 z-10 bg-background shadow-[inset_0_-1px_0_var(--border)]">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.header, h.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
              {row.getIsExpanded() && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="bg-muted/30 p-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm md:grid-cols-4">
                      <Field label="Supplier" value={row.original.supplier ?? "—"} />
                      <Field label="Color" value={row.original.color ?? "—"} />
                      <Field
                        label="Weight"
                        value={row.original.weightG ? `${row.original.weightG}g` : "—"}
                      />
                      <Field
                        label="Lead time"
                        value={
                          row.original.leadTimeDays
                            ? `${row.original.leadTimeDays} days`
                            : "—"
                        }
                      />
                      <Field
                        label="Margin"
                        value={
                          row.original.marginPct !== undefined
                            ? `${(row.original.marginPct * 100).toFixed(0)}%`
                            : "—"
                        }
                      />
                      <Field label="Created" value={row.original.createdAt} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
