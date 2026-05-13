"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
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

export function FooterSummaryDataTable({ data }: Props) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table containerClassName="max-h-[480px]">
        <TableHeader>
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
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <tfoot className="sticky bottom-0 z-10 bg-muted/80 backdrop-blur">
          {table.getFooterGroups().map((fg) => (
            <TableRow key={fg.id}>
              {fg.headers.map((h) => (
                <TableCell key={h.id}>
                  {h.isPlaceholder
                    ? null
                    : flexRender(h.column.columnDef.footer, h.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </tfoot>
      </Table>
    </div>
  );
}
