# Table Demos — Design

**Date:** 2026-05-10
**Status:** Draft for review
**Owner:** UI examples folder

## Goal

Extend `src/app/(app)/examples/` with seven new self-contained table demos, each illustrating one TanStack Table + shadcn pattern. They serve as in-repo reference implementations the team can copy from when building real features.

## Non-goals

- No persistence. All demos mutate local component state.
- No Server Actions, no DB writes, no auth gating beyond what the existing `(app)` route group already provides.
- No new shared "data-table" abstraction — each demo stays self-contained, like the existing `filter-table`. Repetition across demos is fine and expected; it makes each demo readable on its own.

## Demos

Each demo lives in `src/app/(app)/examples/<slug>/` with three files matching the existing convention:
- `page.tsx` — server component shell, passes `MOCK_PRODUCTS` to the client table.
- `columns.tsx` — `ColumnDef<Product>[]` plus any column-local cell components.
- `data-table.tsx` — client component that owns `useReactTable` and table-level UI.

| Slug | Sidebar label | Lucide icon | What it shows |
|---|---|---|---|
| `edit-table` | Inline edit | `Pencil` | Cell-level inline editing (text / number / select). Enter commits, Esc reverts. Reset button restores. |
| `select-table` | Row selection | `CheckSquare` | Checkbox column + select-all. Sticky bulk-action toolbar appears when rows are selected; bulk Archive / Delete with toast confirmation. |
| `reorder-table` | Reorder rows | `GripVertical` | Drag handle column; drag rows to reorder. Reset order button. |
| `expand-table` | Expandable rows | `ChevronRight` | Chevron column toggles per-row expansion. Expanded panel shows description and secondary fields. |
| `sticky-header-table` | Sticky header | `PanelTop` | Tall scroll container; `<thead>` pinned via `sticky top-0`. Mock data tripled to give meaningful vertical scroll. |
| `scroll-table` | Horizontal scroll | `MoveHorizontal` | Wide column set (~12 cols). Container `overflow-x-auto`. Leftmost name column pinned via `sticky left-0` for column-pinning effect. |
| `footer-summary-table` | Footer summary | `Sigma` | `<tfoot>` rendered via `getFooterGroups()`, `sticky bottom-0`. Footer cells show total stock, average price, total inventory value. |

## Data

All demos consume `MOCK_PRODUCTS` from `src/lib/examples/mock-data.ts`.

To support the wide horizontal-scroll demo, extend the `Product` type with **optional** fields:

```ts
supplier?: string;     // e.g. "Northwind Co."
weightG?: number;      // grams
color?: string;        // e.g. "Slate"
leadTimeDays?: number; // 1..28
marginPct?: number;    // 0..0.6
```

These are populated for every record by the existing deterministic generator. Because they are optional, existing consumers (`filter-table`, `detail`) are unaffected.

For `sticky-header-table`, generate a longer dataset inline by mapping `MOCK_PRODUCTS` three times with id/sku suffixes — keeps `mock-data.ts` lean and the duplication stays local to the demo that needs it.

## Dependencies

Add (latest versions, user-approved):

- `@dnd-kit/react`
- `@dnd-kit/dom` (transitive but listed for visibility)

Used only by `reorder-table`. Use the v7 `useSortable({ id, index })` API that returns a single `ref` — no manual transform/transition wiring.

Note: `@dnd-kit/react` is pre-1.0 (0.1.x). API may change in future minor versions. Acceptable for a demo; would re-evaluate before adopting in a production feature path.

## Per-demo implementation notes

### edit-table

- `data-table.tsx` keeps the editable rows in `useState<Product[]>(initialData)` and exposes an `updateRow(id, patch)` callback via `meta` on the table, per TanStack's recommended pattern.
- A small `EditableCell` component handles three input variants:
  - `text` — for `name`
  - `number` — for `price`, `stock` (HTML `type="number"`, `step` configurable)
  - `select` — for `status` and `category` (shadcn `Select`)
- Editing model: click cell → input renders focused; **Enter** or blur commits; **Escape** reverts to the pre-edit value.
- Reset button replaces the state with the original `MOCK_PRODUCTS`.

### select-table

- TanStack `enableRowSelection: true`, with the standard checkbox column (header + cell) using shadcn `Checkbox`. Not currently in `src/components/ui/`, so install it via `pnpm dlx shadcn@latest add checkbox` as part of this work. No npm dep beyond the shadcn-generated file.
- `rowSelection` state in component.
- When `Object.keys(rowSelection).length > 0`, render a sticky toolbar above the table: `"N selected"` + `Archive` / `Delete` buttons + `Clear`.
- Bulk actions mutate local `data` state and fire a `sonner` toast (`toast.success("Archived 3 products")`). No real persistence.

### reorder-table

- Wraps `<TableBody>` in `<DragDropProvider>` from `@dnd-kit/react`.
- Each row component calls `useSortable({ id: row.original.id, index: row.index })`, attaches `ref` to the `<tr>`.
- A leading "drag" column renders the `GripVertical` icon — its cell is the drag listener target via the v7 `handle` config.
- On drop, recompute order via array splice and update local `data` state.

### expand-table

- TanStack `getExpandedRowModel()` + `getCanExpand: () => true`.
- Leading column with chevron button, rotates 90° when expanded.
- When `row.getIsExpanded()`, render an additional `<TableRow>` directly after with a single `<TableCell colSpan={...}>` containing the detail panel: description (from `MOCK_PRODUCT.description` for the selected row, fall back to a deterministic placeholder) plus a small grid of secondary fields (supplier, weight, lead time).

### sticky-header-table

- Wrap `<Table>` in `<div className="max-h-[480px] overflow-y-auto rounded-md border">`.
- `<TableHeader>` row gets `className="sticky top-0 bg-background z-10"` (or per-`<TableHead>` if needed for the shadow trick).
- Use a tripled dataset (~90 rows) so the scroll is meaningful.

### scroll-table

- Build a wider `ColumnDef<Product>[]` (~12 columns): name, sku, category, supplier, color, price, marginPct, stock, weightG, leadTimeDays, status, createdAt.
- Wrap in `<div className="overflow-x-auto rounded-md border">`.
- Set fixed widths via `className="w-[140px]"` etc. on `<TableHead>` so columns don't squash.
- Pin the name column: both its `<TableHead>` and its `<TableCell>` get `sticky left-0 bg-background` (and the `<TableHead>` also keeps `top-0` so the corner stays clean if combined later).

### footer-summary-table

- Add `footer` definitions to `ColumnDef`s where summary makes sense.
- Render `<TableFooter>` (the shadcn primitive) iterating over `table.getFooterGroups()`.
- Footer container: same scroll wrapper; `<TableFooter>` row uses `sticky bottom-0 bg-muted/50 backdrop-blur`.
- Computed values:
  - Stock column footer: `sum(stock)`
  - Price column footer: `avg(price)` → `$X.XX`
  - Add a derived "value" column with `row.price * row.stock` and footer `sum`.

## Sidebar wiring

In `src/components/app-sidebar.tsx`, append seven entries to `examplesNav` in the order listed in the demos table above. Existing entries stay; only additions.

## File checklist

```
src/lib/examples/mock-data.ts                            (modify: add optional fields + populate)
src/app/(app)/examples/edit-table/page.tsx               (new)
src/app/(app)/examples/edit-table/columns.tsx            (new)
src/app/(app)/examples/edit-table/data-table.tsx         (new)
src/app/(app)/examples/select-table/page.tsx             (new)
src/app/(app)/examples/select-table/columns.tsx          (new)
src/app/(app)/examples/select-table/data-table.tsx       (new)
src/app/(app)/examples/reorder-table/page.tsx            (new)
src/app/(app)/examples/reorder-table/columns.tsx         (new)
src/app/(app)/examples/reorder-table/data-table.tsx      (new)
src/app/(app)/examples/expand-table/page.tsx             (new)
src/app/(app)/examples/expand-table/columns.tsx          (new)
src/app/(app)/examples/expand-table/data-table.tsx       (new)
src/app/(app)/examples/sticky-header-table/page.tsx      (new)
src/app/(app)/examples/sticky-header-table/columns.tsx   (new)
src/app/(app)/examples/sticky-header-table/data-table.tsx (new)
src/app/(app)/examples/scroll-table/page.tsx             (new)
src/app/(app)/examples/scroll-table/columns.tsx          (new)
src/app/(app)/examples/scroll-table/data-table.tsx       (new)
src/app/(app)/examples/footer-summary-table/page.tsx     (new)
src/app/(app)/examples/footer-summary-table/columns.tsx  (new)
src/app/(app)/examples/footer-summary-table/data-table.tsx (new)
src/components/app-sidebar.tsx                           (modify: append 7 nav entries)
package.json                                             (modify: add @dnd-kit/react)
```

Run `pnpm dlx shadcn@latest add checkbox` to add `src/components/ui/checkbox.tsx` (no npm dep).

## Acceptance criteria

- All seven sidebar entries navigate to a working page that demonstrates the named pattern.
- `pnpm typecheck` passes with zero errors.
- `pnpm lint` passes with zero warnings.
- `pnpm build` succeeds.
- No new dependencies beyond `@dnd-kit/react` (and any shadcn-generated UI primitives).
- `filter-table` and `detail` continue to work unchanged.

## Out of scope / explicit non-asks

- Server-side persistence of edits/order/selection.
- A shared abstraction unifying the seven demos. They are intentionally separate.
- Pagination beyond what TanStack provides out of the box (already in `filter-table`).
- Keyboard-first DnD ergonomics beyond what `@dnd-kit/react` gives by default.
