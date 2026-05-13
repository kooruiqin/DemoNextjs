"use client";

import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function EditDataTable({ data: initial }: Props) {
  const [data, setData] = useState<Product[]>(initial);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateRow: (id: string, patch: Partial<Product>) => {
        setData((rows) => rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
      },
    },
  });

  const editedCount = data.filter((row, i) => {
    const original = initial[i];
    if (!original || row.id !== original.id) return true;
    return (
      row.name !== original.name ||
      row.category !== original.category ||
      row.price !== original.price ||
      row.stock !== original.stock ||
      row.status !== original.status
    );
  }).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setData(initial)}>
          <RotateCcw />
          Reset
        </Button>
        <p className="text-xs text-muted-foreground">{editedCount} edited</p>
      </div>

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
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-1.5">
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

type EditableCellProps =
  | {
      kind: "text";
      value: string;
      onCommit: (v: string) => void;
      format?: (v: string) => string;
      renderDisplay?: (v: string) => ReactNode;
    }
  | {
      kind: "number";
      value: number;
      onCommit: (v: number) => void;
      format?: (v: number) => string;
      renderDisplay?: (v: number) => ReactNode;
    }
  | {
      kind: "select";
      value: string;
      options: { label: string; value: string }[];
      onCommit: (v: string) => void;
      format?: (v: string) => string;
      renderDisplay?: (v: string) => ReactNode;
    };

export function EditableCell(props: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | number>(props.value);

  if (!editing) {
    let display: ReactNode;
    if (props.kind === "number") {
      display = props.renderDisplay
        ? props.renderDisplay(props.value)
        : props.format
          ? props.format(props.value)
          : String(props.value);
    } else {
      display = props.renderDisplay
        ? props.renderDisplay(props.value)
        : props.format
          ? props.format(props.value)
          : props.value;
    }
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(props.value);
          setEditing(true);
        }}
        className="w-full rounded px-2 py-1 text-left hover:bg-muted"
      >
        {display}
      </button>
    );
  }

  if (props.kind === "select") {
    return (
      <Select
        defaultValue={String(draft)}
        onValueChange={(v) => {
          props.onCommit(v);
          setEditing(false);
        }}
        open
        onOpenChange={(o) => !o && setEditing(false)}
      >
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {props.options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      autoFocus
      type={props.kind === "number" ? "number" : "text"}
      value={draft}
      onChange={(e) =>
        setDraft(props.kind === "number" ? Number(e.target.value) : e.target.value)
      }
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          if (props.kind === "number") props.onCommit(Number(draft));
          else props.onCommit(String(draft));
          setEditing(false);
        }
        if (e.key === "Escape") {
          setEditing(false);
        }
      }}
      onBlur={() => {
        if (props.kind === "number") props.onCommit(Number(draft));
        else props.onCommit(String(draft));
        setEditing(false);
      }}
      className="h-8"
    />
  );
}
