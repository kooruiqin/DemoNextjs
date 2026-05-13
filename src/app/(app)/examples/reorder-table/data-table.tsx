"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
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

export function ReorderDataTable({ data: initial }: Props) {
  const [data, setData] = useState<Product[]>(initial);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  function handleDragEnd(event: DragEndEvent) {
    const sourceId = event.operation.source?.id;
    const targetId = event.operation.target?.id;
    if (!sourceId || !targetId || sourceId === targetId) return;
    setData((rows) => {
      const from = rows.findIndex((r) => r.id === sourceId);
      const to = rows.findIndex((r) => r.id === targetId);
      if (from < 0 || to < 0) return rows;
      const next = rows.slice();
      const [moved] = next.splice(from, 1);
      if (moved) next.splice(to, 0, moved);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setData(initial)}>
          <RotateCcw />
          Reset order
        </Button>
      </div>

      <div className="rounded-md border">
        <DragDropProvider onDragEnd={handleDragEnd}>
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
              {table.getRowModel().rows.map((row, index) => (
                <SortableRow key={row.id} row={row} index={index} />
              ))}
            </TableBody>
          </Table>
        </DragDropProvider>
      </div>
    </div>
  );
}

function SortableRow({ row, index }: { row: Row<Product>; index: number }) {
  const { ref, isDragging } = useSortable({ id: row.original.id, index });

  return (
    <TableRow
      ref={ref as unknown as React.Ref<HTMLTableRowElement>}
      data-dragging={isDragging || undefined}
      className="data-[dragging=true]:bg-muted/50"
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
