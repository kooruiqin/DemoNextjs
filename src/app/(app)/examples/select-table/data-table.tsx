"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table";
import { Archive, Trash2, X } from "lucide-react";
import { toast } from "sonner";

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

export function SelectDataTable({ data: initial }: Props) {
  const [data, setData] = useState<Product[]>(initial);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    getRowId: (row) => row.id,
  });

  const selectedIds = Object.keys(rowSelection);
  const hasSelection = selectedIds.length > 0;

  function archiveSelected() {
    setData((rows) =>
      rows.map((r) => (selectedIds.includes(r.id) ? { ...r, status: "archived" } : r)),
    );
    toast.success(`Archived ${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"}`);
    setRowSelection({});
  }

  function deleteSelected() {
    setData((rows) => rows.filter((r) => !selectedIds.includes(r.id)));
    toast.success(`Deleted ${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"}`);
    setRowSelection({});
  }

  return (
    <div className="space-y-3">
      {hasSelection && (
        <div className="sticky top-2 z-20 flex items-center gap-2 rounded-md border bg-background/90 p-2 shadow-sm backdrop-blur">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={archiveSelected}>
              <Archive />
              Archive
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteSelected}>
              <Trash2 />
              Delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setRowSelection({})}>
              <X />
              Clear
            </Button>
          </div>
        </div>
      )}

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
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
