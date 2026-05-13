# Table Demos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add seven new TanStack Table demos under `src/app/(app)/examples/`: inline edit, row selection + bulk actions, drag reorder, expandable rows, sticky header, horizontal scroll, footer summary. All client-side, mutating local state from `MOCK_PRODUCTS`.

**Architecture:** Each demo is its own folder (`page.tsx` + `columns.tsx` + `data-table.tsx`), mirroring the existing `filter-table` convention. No shared abstraction. Demos extend the `Product` mock with optional fields so they don't break existing consumers (`filter-table`, `detail`).

**Tech Stack:** Next.js 16 (App Router, RSC), TanStack Table v8, shadcn/ui, Tailwind, `@dnd-kit/react` (v7, pre-1.0). No backend, no Server Actions.

**Testing approach:** These are UI demos — no unit tests. Verification per task: `pnpm typecheck` must pass. Final task runs `pnpm lint` and `pnpm build`. The user will visually QA each page in `pnpm dev` after the plan completes.

---

## Task 1: Foundation — deps, mock data, shadcn checkbox

**Files:**
- Modify: `package.json` (via `pnpm add`)
- Modify: `src/lib/examples/mock-data.ts`
- Create (via shadcn CLI): `src/components/ui/checkbox.tsx`

- [ ] **Step 1: Install `@dnd-kit/react`**

Run:
```bash
pnpm add @dnd-kit/react
```
Expected: package added to `dependencies`. `@dnd-kit/dom` and `@dnd-kit/abstract` come along as transitive deps. Verify with:
```bash
pnpm list @dnd-kit/react
```

- [ ] **Step 2: Install shadcn `Checkbox`**

Run:
```bash
pnpm dlx shadcn@latest add checkbox
```
Expected: file `src/components/ui/checkbox.tsx` created. No new entry in `package.json` (shadcn copies source).

- [ ] **Step 3: Extend `Product` type with optional fields**

Open `src/lib/examples/mock-data.ts`. Replace the `Product` type and the `MOCK_PRODUCTS` generator so each product carries the new optional fields. Final file content:

```ts
export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: "Apparel" | "Electronics" | "Home" | "Books" | "Sports";
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  supplier?: string;
  weightG?: number;
  color?: string;
  leadTimeDays?: number;
  marginPct?: number;
};

const CATEGORIES: Product["category"][] = [
  "Apparel",
  "Electronics",
  "Home",
  "Books",
  "Sports",
];

const STATUSES: ProductStatus[] = ["active", "draft", "archived"];

const SUPPLIERS = [
  "Northwind Co.",
  "Acme Trading",
  "Helio Imports",
  "Pinnacle Goods",
  "Tide & Co.",
];

const COLORS = ["Slate", "Bone", "Moss", "Clay", "Indigo", "Sand", "Rust"];

const NAMES = [
  "Atlas Tee",
  "Nimbus Hoodie",
  "Glacier Mug",
  "Helio Lamp",
  "Quartz Watch",
  "Pebble Speaker",
  "Drift Backpack",
  "Loom Blanket",
  "Forge Knife Set",
  "Beacon Headphones",
  "Cinder Candle",
  "Vista Notebook",
  "Pulse Yoga Mat",
  "Tide Water Bottle",
  "Echo Earbuds",
  "Roam Sneakers",
  "Spire Pen",
  "Verdant Planter",
  "Halcyon Pillow",
  "Mosaic Throw",
  "Forge Skillet",
  "Aether Drone",
  "Pinnacle Tent",
  "Cascade Kettle",
  "Lumen Reading Light",
  "Boulder Climbing Holds",
  "Thicket Coffee Table",
  "Glide Skateboard",
  "Anchor Wallet",
  "Flint Lighter",
];

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const MOCK_PRODUCTS: Product[] = NAMES.map((name, i) => {
  const r = rand(i + 1);
  const cat = CATEGORIES[Math.floor(r() * CATEGORIES.length)]!;
  const status = STATUSES[Math.floor(r() * STATUSES.length)]!;
  const price = Math.round((r() * 280 + 12) * 100) / 100;
  const stock = Math.floor(r() * 250);
  const day = String((i % 28) + 1).padStart(2, "0");
  const month = String(((i * 3) % 12) + 1).padStart(2, "0");
  const supplier = SUPPLIERS[Math.floor(r() * SUPPLIERS.length)]!;
  const color = COLORS[Math.floor(r() * COLORS.length)]!;
  const weightG = Math.floor(r() * 1900 + 100);
  const leadTimeDays = Math.floor(r() * 27 + 1);
  const marginPct = Math.round(r() * 60) / 100;
  return {
    id: `prod_${String(i + 1).padStart(3, "0")}`,
    name,
    sku: `SKU-${(1000 + i * 7).toString(36).toUpperCase()}`,
    category: cat,
    price,
    stock,
    status,
    createdAt: `2026-${month}-${day}`,
    supplier,
    color,
    weightG,
    leadTimeDays,
    marginPct,
  };
});

export const PRODUCT_CATEGORIES: readonly Product["category"][] = CATEGORIES;

export const MOCK_PRODUCT: Product & { description: string } = {
  ...MOCK_PRODUCTS[0]!,
  description:
    "A soft, breathable everyday tee in mid-weight cotton. Pre-washed for minimal shrinkage. Reinforced stitching at the collar.",
};
```

- [ ] **Step 4: Verify typecheck still passes (existing consumers unaffected)**

Run:
```bash
pnpm typecheck
```
Expected: zero errors. `filter-table` and `detail` use only the original fields and continue to work.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/ui/checkbox.tsx src/lib/examples/mock-data.ts
git commit -m "Add dnd-kit, shadcn checkbox, extend mock product fields"
```

---

## Task 2: Inline edit demo

**Files:**
- Create: `src/app/(app)/examples/edit-table/page.tsx`
- Create: `src/app/(app)/examples/edit-table/columns.tsx`
- Create: `src/app/(app)/examples/edit-table/data-table.tsx`
- Modify: `src/components/app-sidebar.tsx` (append nav entry)

- [ ] **Step 1: Create `page.tsx`**

```tsx
import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { EditDataTable } from "./data-table";

export default function EditTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Inline edit table</h1>
        <p className="text-sm text-muted-foreground">
          Click any cell to edit. Press Enter to commit, Escape to revert. Reset
          restores the original mock data.
        </p>
      </div>
      <EditDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
```

- [ ] **Step 2: Create `columns.tsx`**

```tsx
"use client";

import type { ColumnDef, RowData } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PRODUCT_CATEGORIES, type Product } from "@/lib/examples/mock-data";
import { EditableCell } from "./data-table";

declare module "@tanstack/react-table" {
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
```

- [ ] **Step 3: Create `data-table.tsx`**

```tsx
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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setData(initial)}>
          <RotateCcw />
          Reset
        </Button>
        <p className="text-xs text-muted-foreground">
          {data.filter((r, i) => r !== initial[i]).length} edited
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
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
    const display = props.renderDisplay
      ? props.renderDisplay(props.value as never)
      : props.format
        ? props.format(props.value as never)
        : String(props.value);
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
```

- [ ] **Step 4: Append nav entry in `src/components/app-sidebar.tsx`**

Find the `examplesNav` array and add to the end (preserve existing entries):

```tsx
{ title: "Inline edit", href: "/examples/edit-table" as Route, icon: Pencil },
```

Add `Pencil` to the existing `lucide-react` import on the same file.

- [ ] **Step 5: Verify typecheck**

Run:
```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/examples/edit-table src/components/app-sidebar.tsx
git commit -m "Add inline-edit table example"
```

---

## Task 3: Row selection + bulk actions demo

**Files:**
- Create: `src/app/(app)/examples/select-table/page.tsx`
- Create: `src/app/(app)/examples/select-table/columns.tsx`
- Create: `src/app/(app)/examples/select-table/data-table.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Create `page.tsx`**

```tsx
import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { SelectDataTable } from "./data-table";

export default function SelectTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Row selection</h1>
        <p className="text-sm text-muted-foreground">
          Select rows with the checkbox column. A sticky toolbar appears with
          bulk Archive and Delete actions.
        </p>
      </div>
      <SelectDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
```

- [ ] **Step 2: Create `columns.tsx`**

```tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "@/lib/examples/mock-data";

const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
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
```

- [ ] **Step 3: Create `data-table.tsx`**

```tsx
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
        <Table>
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
```

- [ ] **Step 4: Append nav entry**

In `src/components/app-sidebar.tsx`, add to `examplesNav`:

```tsx
{ title: "Row selection", href: "/examples/select-table" as Route, icon: CheckSquare },
```

Add `CheckSquare` to the `lucide-react` import.

- [ ] **Step 5: Verify typecheck**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/examples/select-table src/components/app-sidebar.tsx
git commit -m "Add row-selection table example with bulk actions"
```

---

## Task 4: Drag-and-drop reorder demo

**Files:**
- Create: `src/app/(app)/examples/reorder-table/page.tsx`
- Create: `src/app/(app)/examples/reorder-table/columns.tsx`
- Create: `src/app/(app)/examples/reorder-table/data-table.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Create `page.tsx`**

```tsx
import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { ReorderDataTable } from "./data-table";

export default function ReorderTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Reorder rows</h1>
        <p className="text-sm text-muted-foreground">
          Drag a row by its handle to reorder. Built with @dnd-kit/react v7.
        </p>
      </div>
      <ReorderDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
```

- [ ] **Step 2: Create `columns.tsx`**

```tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/examples/mock-data";

const STATUS_VARIANT: Record<Product["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

export const columns: ColumnDef<Product>[] = [
  {
    id: "drag",
    header: () => null,
    cell: () => (
      <span className="flex cursor-grab items-center text-muted-foreground">
        <GripVertical className="size-4" />
      </span>
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
```

- [ ] **Step 3: Create `data-table.tsx`**

```tsx
"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row,
} from "@tanstack/react-table";
import { DragDropProvider } from "@dnd-kit/react";
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

  function handleDragEnd(event: { operation: { source: { id: string } | null; target: { id: string } | null } }) {
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
          <Table>
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
```

- [ ] **Step 4: Append nav entry**

In `src/components/app-sidebar.tsx`, add:

```tsx
{ title: "Reorder rows", href: "/examples/reorder-table" as Route, icon: GripVertical },
```

Add `GripVertical` to the `lucide-react` import.

- [ ] **Step 5: Verify typecheck**

```bash
pnpm typecheck
```
Expected: zero errors. If `@dnd-kit/react` event payload types differ from the inline shape used in `handleDragEnd`, switch the parameter type to `any` with a `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comment and a note "@dnd-kit/react v0.1.x DragEndEvent type", since the package is pre-1.0 — flag this in the commit message.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/examples/reorder-table src/components/app-sidebar.tsx
git commit -m "Add drag-reorder table example using @dnd-kit/react"
```

---

## Task 5: Expandable rows demo

**Files:**
- Create: `src/app/(app)/examples/expand-table/page.tsx`
- Create: `src/app/(app)/examples/expand-table/columns.tsx`
- Create: `src/app/(app)/examples/expand-table/data-table.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Create `page.tsx`**

```tsx
import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { ExpandDataTable } from "./data-table";

export default function ExpandTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Expandable rows</h1>
        <p className="text-sm text-muted-foreground">
          Click the chevron to expand a row and see secondary detail.
        </p>
      </div>
      <ExpandDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
```

- [ ] **Step 2: Create `columns.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `data-table.tsx`**

```tsx
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
      <Table>
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
```

- [ ] **Step 4: Append nav entry**

In `src/components/app-sidebar.tsx`, add:

```tsx
{ title: "Expandable rows", href: "/examples/expand-table" as Route, icon: ChevronRight },
```

Add `ChevronRight` to the `lucide-react` import (if not already present in that file).

- [ ] **Step 5: Verify typecheck**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/examples/expand-table src/components/app-sidebar.tsx
git commit -m "Add expandable-rows table example"
```

---

## Task 6: Sticky header demo

**Files:**
- Create: `src/app/(app)/examples/sticky-header-table/page.tsx`
- Create: `src/app/(app)/examples/sticky-header-table/columns.tsx`
- Create: `src/app/(app)/examples/sticky-header-table/data-table.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Create `page.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `columns.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `data-table.tsx`**

```tsx
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

export function StickyHeaderDataTable({ data }: Props) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="relative max-h-[480px] overflow-y-auto rounded-md border">
      <Table>
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
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 4: Append nav entry**

In `src/components/app-sidebar.tsx`, add:

```tsx
{ title: "Sticky header", href: "/examples/sticky-header-table" as Route, icon: PanelTop },
```

Add `PanelTop` to the `lucide-react` import.

- [ ] **Step 5: Verify typecheck**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/examples/sticky-header-table src/components/app-sidebar.tsx
git commit -m "Add sticky-header table example"
```

---

## Task 7: Horizontal scroll demo (with pinned first column)

**Files:**
- Create: `src/app/(app)/examples/scroll-table/page.tsx`
- Create: `src/app/(app)/examples/scroll-table/columns.tsx`
- Create: `src/app/(app)/examples/scroll-table/data-table.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Create `page.tsx`**

```tsx
import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { ScrollDataTable } from "./data-table";

export default function ScrollTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Horizontal scroll</h1>
        <p className="text-sm text-muted-foreground">
          Wide table with many columns. The Name column stays pinned to the left
          as you scroll horizontally.
        </p>
      </div>
      <ScrollDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
```

- [ ] **Step 2: Create `columns.tsx`**

```tsx
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
    meta: { pinned: true } as { pinned?: boolean },
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
```

- [ ] **Step 3: Create `data-table.tsx`**

```tsx
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
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/examples/mock-data";
import { columns } from "./columns";

type Props = { data: Product[] };

const PINNED = "sticky left-0 z-10 bg-background";

export function ScrollDataTable({ data }: Props) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table className="min-w-[1400px]">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => {
                const pinned = h.column.id === "name";
                return (
                  <TableHead
                    key={h.id}
                    className={cn("min-w-[120px]", pinned && PINNED, pinned && "min-w-[180px]")}
                  >
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                const pinned = cell.column.id === "name";
                return (
                  <TableCell
                    key={cell.id}
                    className={cn("whitespace-nowrap", pinned && PINNED)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 4: Append nav entry**

In `src/components/app-sidebar.tsx`, add:

```tsx
{ title: "Horizontal scroll", href: "/examples/scroll-table" as Route, icon: MoveHorizontal },
```

Add `MoveHorizontal` to the `lucide-react` import.

- [ ] **Step 5: Verify typecheck**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/examples/scroll-table src/components/app-sidebar.tsx
git commit -m "Add horizontal-scroll table example with pinned first column"
```

---

## Task 8: Footer summary demo

**Files:**
- Create: `src/app/(app)/examples/footer-summary-table/page.tsx`
- Create: `src/app/(app)/examples/footer-summary-table/columns.tsx`
- Create: `src/app/(app)/examples/footer-summary-table/data-table.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Create `page.tsx`**

```tsx
import { MOCK_PRODUCTS } from "@/lib/examples/mock-data";
import { FooterSummaryDataTable } from "./data-table";

export default function FooterSummaryTableExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Footer summary</h1>
        <p className="text-sm text-muted-foreground">
          Sticky footer row with totals and averages computed across all rows.
        </p>
      </div>
      <FooterSummaryDataTable data={MOCK_PRODUCTS} />
    </div>
  );
}
```

- [ ] **Step 2: Create `columns.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `data-table.tsx`**

```tsx
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
  TableFooter,
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
    <div className="relative max-h-[480px] overflow-y-auto rounded-md border">
      <Table>
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
        <TableFooter className="sticky bottom-0 z-10 bg-muted/80 backdrop-blur">
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
        </TableFooter>
      </Table>
    </div>
  );
}
```

- [ ] **Step 4: Append nav entry**

In `src/components/app-sidebar.tsx`, add:

```tsx
{ title: "Footer summary", href: "/examples/footer-summary-table" as Route, icon: Sigma },
```

Add `Sigma` to the `lucide-react` import.

- [ ] **Step 5: Verify typecheck**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/examples/footer-summary-table src/components/app-sidebar.tsx
git commit -m "Add footer-summary table example"
```

---

## Task 9: Final verification

- [ ] **Step 1: Lint**

Run:
```bash
pnpm lint
```
Expected: zero warnings, zero errors.

- [ ] **Step 2: Build**

Run:
```bash
pnpm build
```
Expected: build succeeds. All seven new routes appear in the build output as static or dynamic routes.

- [ ] **Step 3: If anything fails, fix and re-verify**

Common issues and fixes:
- **`@dnd-kit/react` event payload type mismatch:** Loosen the parameter type in Task 4 step 3 (`handleDragEnd`) to `any` with the eslint disable comment described in Task 4 step 5.
- **Sidebar typed-route error:** Make sure each new `href` uses the `as Route` cast (already in the snippets). The `Route` type is imported from `next` in `app-sidebar.tsx` — keep using whatever symbol the existing entries use.
- **`Fragment` import in Task 5:** Move the import to the top of the file rather than mid-file as written in the plan for readability.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "Fix typecheck/lint after table demos"
```

---

## Spec coverage check

| Spec demo | Plan task |
|---|---|
| Inline edit | Task 2 |
| Row selection + bulk actions | Task 3 |
| Drag-and-drop reorder | Task 4 |
| Expandable rows | Task 5 |
| Sticky header | Task 6 |
| Horizontal scroll | Task 7 |
| Footer summary | Task 8 |
| Mock data extension | Task 1 |
| dnd-kit dependency | Task 1 |
| shadcn checkbox | Task 1 |
| Sidebar wiring (×7) | Each demo task, step 4 |
| typecheck/lint/build | Task 9 |
