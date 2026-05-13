# Profile change-password + Examples demo pages — Design

**Date:** 2026-05-09
**Status:** Approved by user, executing in same session

## Goal

1. Let signed-in users change their password from `/profile`.
2. Provide a set of UI templates under `/examples/*` (table, form, wizard, modal, toast, detail/edit, preferences) that future features can copy from.

## Non-goals

- No password reset / forgot-password flow (separate work).
- No real persistence on the example pages — they use mock in-memory data.
- No new DB tables, migrations, or seed scripts.

---

## 1. Change password on `/profile`

### UI

A new "Password" `<Card>` rendered after the existing 3-column grid on `/profile`. Three fields, stacked:

- Current password
- New password
- Confirm new password

A single "Update password" button. On success, the form resets and a success toast fires. Errors map to field-level messages (wrong current password → field error on Current password).

### Validation

`src/lib/schemas/password.ts`:

```ts
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Min 8 characters")
      .regex(/[0-9]/, "Must include a number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
```

### Mechanism

Better-Auth client SDK call from a Client Component:

```ts
const { error } = await authClient.changePassword({
  currentPassword,
  newPassword,
  revokeOtherSessions: true,
});
```

No new Server Action — Better-Auth's `/api/auth/change-password` route handles current-password verification.

### Files

- `src/lib/schemas/password.ts` (new) — Zod schema
- `src/app/(app)/profile/password-form.tsx` (new) — `"use client"` form
- `src/app/(app)/profile/page.tsx` (edit) — render the new card

---

## 2. Examples templates under `/examples/*`

### Routes

All under `src/app/(app)/examples/`:

| Path | Component file | Purpose |
|------|---------------|---------|
| `/examples/detail` | `detail/page.tsx` + `detail/edit-form.tsx` | Detail/edit page |
| `/examples/wizard` | `wizard/page.tsx` + `wizard/wizard-form.tsx` | 3-step form wizard |
| `/examples/filter-table` | `filter-table/page.tsx` + `filter-table/data-table.tsx` + `filter-table/columns.tsx` | Filterable/searchable table |
| `/examples/preferences` | `preferences/page.tsx` + `preferences/*-section.tsx` | Sectioned preferences |
| `/examples/modal` | `modal/page.tsx` + `modal/*-demo.tsx` | Dialog + AlertDialog demos |
| `/examples/toast` | `toast/page.tsx` + `toast/toast-demo.tsx` | Sonner toast variants |

### Mock data

`src/lib/examples/mock-data.ts` exports plain arrays:

- `MOCK_PRODUCTS`: 30 fake product rows (id, name, sku, category, price, stock, status, createdAt) — drives detail and filter-table.
- `MOCK_PRODUCT` (single record) — drives detail page.

### Sidebar

Add a third `SidebarGroup` "Examples" in `src/components/app-sidebar.tsx` with the 6 entries above. Icons: `FileSearch`, `ListOrdered`, `Filter`, `SlidersHorizontal`, `Square`, `Bell` (all from `lucide-react`).

### New shadcn components needed

`dialog`, `alert-dialog`, `switch`, `select`, `progress`, `radio-group`. Installed via `pnpm dlx shadcn@latest add ...`.

### Per-demo specs

**detail** — Page header (title + status badge + back link). Two-column on `lg:`: left card shows read-only metadata (sku, category, price, stock, createdAt). Right card holds the edit form (name, description, price, stock) using RHF + Zod. Uses local React state to toggle Edit/Save/Cancel; on save, mock-update with toast (no persistence).

**wizard** — Top: `<Progress>` bar + step labels (1. Account, 2. Profile, 3. Review). Each step is a sub-form with its own Zod schema. State accumulated in parent. "Back" disabled on step 1; "Next" validates current step before advancing. Step 3 shows a read-only summary + Submit button → toast "Submitted (demo)".

**filter-table** — Toolbar above table: search `<Input>` (filters by name), category `<Select>` facet, column-visibility `<DropdownMenu>`, "Reset" button. TanStack `getFilteredRowModel`, `getSortedRowModel`, `getPaginationRowModel`. Sortable header for name/price/stock. Pagination controls below table.

**preferences** — Three stacked cards:
- Notifications: 3 `<Switch>` toggles (Email, Push, Weekly digest)
- Privacy: `<RadioGroup>` for profile visibility (Public/Members/Private)
- Integrations: list of 3 fake integrations with Connect/Disconnect buttons

Single "Save preferences" button → toast (no persistence).

**modal** — Three demo cards:
- Simple `<Dialog>` containing a one-field form
- `<AlertDialog>` for a destructive confirm action
- Controlled `<Dialog>` whose `open` state lives in the parent (with an external "Close from parent" button to demonstrate)

**toast** — Grid of buttons that trigger `toast.success`, `toast.error`, `toast.info`, `toast.warning`, `toast.promise(...)` (with a fake delayed promise), and a custom toast with an action button.

---

## 3. Auth and access

All `/examples/*` and `/profile` routes sit inside `src/app/(app)/` so the existing `(app)/layout.tsx` session guard applies. No additional protection logic.

## 4. Risks / edge cases

- Better-Auth `changePassword` may reject for reasons beyond wrong current password (rate limit, session invalid). The error message returned is shown verbatim in a root error; field error only fires on the well-known "invalid password" case.
- The example pages share `mock-data.ts` — if multiple demos mutate the same array, they'll share state across navigation. We avoid this by treating mock data as read-only and keeping any "edits" in component-local React state only.
- Sidebar gets 6 new entries. With Platform (4) + Account (2) + Examples (6) = 12 entries total, still fits on a typical viewport without scrolling at desktop sizes.

## 5. Definition of done

- `/profile` shows the Password card; happy path + wrong-current-password path both produce sensible UI feedback.
- All six example routes render without runtime errors and look reasonable at 375px and 1280px widths.
- `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass.
- No new dependencies added beyond shadcn-installed ones (which add to `package.json` automatically through their generated component files; flag if any extra runtime dep appears).
