# Admin Dashboard Template — Design

**Date:** 2026-05-08
**Status:** Approved (pending spec review)
**Author:** brainstorming session with user

## Goal

Convert the existing post-login `(app)` shell from a top-nav layout into a shadcn-sidebar admin template with the following pages:

- Dashboard — stat cards + recent activity
- Analytics — DB-backed counts + simple posts-per-day breakdown
- Users — read-only TanStack data-table of all users
- Posts — keep existing CRUD page
- Profile — edit display name
- Settings — tabbed page with General / Appearance / Account

A header theme toggle (light / dark / system) is added, and an Appearance section in Settings exposes the same control.

## Non-goals (YAGNI)

- Avatar upload (R2 storage is a stub; not configured for this work)
- Editing email (Better-Auth email-change requires a verification flow that is out of scope)
- Charts library — Analytics will use simple HTML/CSS bars from grouped query data
- User-row actions (delete, promote, etc.) — would require RBAC
- RBAC / role system — flagged as a follow-up below

## Auth scope

This is a template. **Any authenticated user can see all pages, including the Users list.** No role gating is added. A real product would gate `/users` and `/analytics` behind an admin role; that is a separate piece of work.

## Architecture

```
src/
├── app/(app)/
│   ├── layout.tsx              REWRITE — SidebarProvider + AppSidebar + header
│   ├── dashboard/page.tsx      REWRITE — stat cards (users, sessions, posts) + recent posts
│   ├── analytics/page.tsx      NEW — totals + posts-per-day (last 30 days)
│   ├── users/page.tsx          NEW — TanStack data-table of all users
│   ├── users/columns.tsx       NEW
│   ├── users/data-table.tsx    NEW (or reuse posts pattern)
│   ├── posts/...               UNCHANGED
│   ├── profile/page.tsx        NEW — edit display name (RHF + zod + Server Action)
│   ├── profile/profile-form.tsx NEW — client form
│   └── settings/page.tsx       NEW — tabs: General / Appearance / Account
├── components/
│   ├── app-sidebar.tsx         NEW — sidebar with nav items, brand, user footer
│   ├── nav-user.tsx            NEW — avatar + dropdown (profile, settings, sign out)
│   ├── theme-toggle.tsx        NEW — header dropdown (light / dark / system)
│   └── ui/                     shadcn additions: sidebar, dropdown-menu, avatar,
│                                separator, tabs, skeleton, badge, tooltip, sheet
├── server/
│   ├── queries/
│   │   ├── stats.ts            NEW — counts + recent posts
│   │   └── users.ts            NEW — list users for /users page
│   └── actions/
│       └── profile.ts          NEW — updateProfile (calls auth.api.updateUser)
└── lib/schemas/
    └── profile.ts              NEW — updateProfileSchema (name only)
```

## shadcn components to install

```
pnpm dlx shadcn@latest add sidebar dropdown-menu avatar separator tabs skeleton badge tooltip sheet
```

(Some of these are transitive deps of `sidebar`; running them all is safe — shadcn skips already-installed.)

## Layout structure

`src/app/(app)/layout.tsx`:

```
<SidebarProvider>
  <AppSidebar /> {/* left, collapsible */}
  <SidebarInset>
    <header className="flex h-14 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" />
      {/* breadcrumb-ish: page title from a small client helper or static for now */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
    <main className="p-6">{children}</main>
  </SidebarInset>
</SidebarProvider>
```

`AppSidebar` renders:

- Brand block (app name)
- `SidebarGroup`: Dashboard, Analytics, Users, Posts (each with lucide icon + Link)
- `SidebarGroup`: Profile, Settings
- `SidebarFooter`: `<NavUser>` showing avatar fallback + name + dropdown (Profile, Settings, Sign out)

Active item is determined via `usePathname()` from `next/navigation` in a small client wrapper. The sidebar itself is RSC-friendly; only the active-link logic is `"use client"`.

## Data flow

### Dashboard
Server Component calls `getDashboardStats()` from `server/queries/stats.ts`:

```ts
// drizzle counts
const [users, sessions, posts] = await Promise.all([
  db.$count(usersTable),
  db.$count(sessionsTable),
  db.$count(postsTable),
]);
const recent = await db
  .select(...)
  .from(postsTable)
  .orderBy(desc(postsTable.createdAt))
  .limit(5);
```

Renders 3 stat cards (using `Card` + a custom small `StatCard` composition) + a "Recent posts" card listing the 5 most recent posts.

### Analytics
Server Component calls `getAnalytics()`:
- Same totals as dashboard
- Posts grouped by day for last 30 days (Drizzle `sql` template for `date_trunc('day', created_at)`)
- Renders totals + a horizontal bar list (CSS bars proportional to max count)

### Users
Server Component calls `listUsers()` returning `{ id, name, email, createdAt }`. Page renders shadcn data-table (mirroring the posts pattern in `app/(app)/posts/data-table.tsx`). Columns: Name, Email, Joined. Read-only.

### Profile
- RSC page reads current user from session, passes `defaultValues` to `<ProfileForm>` (client).
- Form: RHF + `zodResolver(updateProfileSchema)`. Single field: `name` (1–50 chars).
- Submit → Server Action `updateProfile(input)`:
  - `requireSession()`
  - `safeParse`
  - `auth.api.updateUser({ headers: await headers(), body: { name: parsed.data.name } })`
  - `revalidatePath("/profile")`
  - return `{ data }` or `{ error }`
- Sonner toast on success/failure.

### Settings
Tabs (shadcn `Tabs`):
- **General**: read-only display of email, account created date.
- **Appearance**: same theme toggle component, but inline (radio-group style: Light / Dark / System).
- **Account**: placeholder card pointing to Profile for name edits; danger zone slot left empty (commented out for now).

### Theme toggle
`components/theme-toggle.tsx`:
- `"use client"`
- Uses `useTheme()` from `next-themes`
- DropdownMenu with 3 items (Light / Dark / System)
- Trigger is a button with sun/moon icons that swap via Tailwind `dark:` variants
- Same component is reused inside Settings → Appearance, in a more verbose layout

## Schemas

`lib/schemas/profile.ts`:

```ts
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

No DB schema changes. Better-Auth's `user` table already has `name`, `email`, `image`, `createdAt`.

## Error handling

- Server Actions return `{ data }` or `{ error }`; never throw to the client.
- Form errors surface via `form.setError("root", ...)` and a sonner toast.
- Dashboard / Analytics / Users queries — let errors propagate to the Next.js error boundary (we'll add `error.tsx` files only if a query is reasonably likely to fail; for the template, default boundary is fine).

## Testing

Manual smoke test only for this template:

1. Sign up / log in → land on `/dashboard` with sidebar visible.
2. Click each sidebar item → page renders, active state shows.
3. Toggle theme from header → page re-themes. Refresh → preference persists.
4. Profile → change name → toast → name updates in sidebar `<NavUser>` after revalidation.
5. Settings → Appearance tab toggles theme identically to header.
6. Mobile width (375px) → sidebar collapses into a sheet, trigger button works.

No automated tests added in this round (no test runner is currently configured — Vitest / Playwright in CLAUDE.md are aspirational, not installed).

## Definition of done

- All files in the architecture section created or rewritten as specified.
- `pnpm typecheck` passes.
- `pnpm lint` passes.
- `pnpm build` succeeds.
- Manual smoke test (above) passes.
- No new env vars needed (so `.env.example` untouched).
- No DB schema changes (so no migration to generate).

## Follow-ups (not part of this work)

- RBAC: gate `/users` and `/analytics` behind an admin role.
- Avatar upload to R2 once storage is wired.
- Email-change flow via Better-Auth verification.
- A real charts library (e.g. recharts) when analytics needs more than bars.
- Replace placeholder Account section in Settings with a real "delete account" flow.
