# CLAUDE.md

This file gives Claude Code (and Cursor / Codex / any compatible agent) the rules of this codebase. Read it fully before making any changes. When in doubt, follow the rules here over your prior assumptions.

---

## 1. Project Identity

- **Name**: Daily Mini (working title — rename freely)
- **Type**: Personal daily-use mini app (single-user / small-group, authenticated)
- **Hosting target**: Self-hosted (Hetzner + Coolify) or free-tier cloud (Vercel + Neon). Code must be portable between both.
- **Audience**: The signed-in user managing their own food picks and wallet entries. No public/anonymous surface beyond auth pages.
- **Core principle**: Ship simple, working features. Prefer boring, proven choices over clever ones.

### 1a. Features (scope)

Two independent feature modules. Each lives under `src/app/(app)/<feature>/` and owns its own schema, Zod schemas, server actions, and components.

#### Spin — pick what to eat

A wheel-spin tool to decide lunch / dinner from the user's own list of options.

- **Spin page** (`/spin`) — meal-type tabs (lunch / dinner), a wheel showing the user's enabled options for that meal, a "Spin" button, and a result display when it stops.
- **Settings** (`/spin/settings` or a drawer) — CRUD the list of food options, with `mealType` (lunch / dinner / both), an `enabled` toggle, and an optional `weight` (default 1) to bias the wheel.
- **Recent records** — last N spins (timestamp, mealType, chosen option, optional "accepted / rejected" mark). Compact list on the spin page; full history at `/spin/history`.

Suggested tables (one file each under `src/db/schema/`):
- `food_options` — `id`, `userId` (FK → user), `name`, `mealType` (`"lunch" | "dinner" | "both"`), `enabled` (bool), `weight` (int, default 1), `createdAt`, `updatedAt`.
- `spin_records` — `id`, `userId`, `mealType`, `optionId` (FK → `food_options`, `onDelete: "set null"` so history survives deletes), `optionName` (denormalized text snapshot for deleted options), `accepted` (bool, nullable), `createdAt`.

#### Wallet — track money in / out

A simple personal ledger. Not a budgeting app — just record entries and tag them.

- **Wallet page** (`/wallet`) — running summary (in / out / net), filters (date range, kind, label), `<DataTable>` of entries.
- **Entry form** — `kind` (`"in" | "out"`), `amount`, `place` (where — free text), `description` (what — free text), `occurredAt` (defaults to now), one or more `labels`.
- **Labels** — user-defined tags ("food", "transport", "salary", …). Created inline from the entry form, managed at `/wallet/labels`.

Suggested tables:
- `wallet_entries` — `id`, `userId`, `kind` (`"in" | "out"`), `amount` (`numeric(12,2)` — store as string in Drizzle, never `float`), `currency` (text, default `"MYR"` — adjust to your locale), `place` (text, nullable), `description` (text, nullable), `occurredAt` (timestamp), `createdAt`, `updatedAt`.
- `wallet_labels` — `id`, `userId`, `name`, `color` (text, optional hex), `createdAt`. Unique on `(userId, name)`.
- `wallet_entry_labels` — join table: `entryId` (FK, cascade), `labelId` (FK, cascade), composite PK `(entryId, labelId)`.

Rules that apply across both features:
- Every row is scoped to the signed-in user via `userId`. Every query and action MUST filter by `session.user.id` — there is no admin / shared view.
- Money uses `numeric(12,2)`, never `float` / `real`. Format for display with `Intl.NumberFormat`, not custom string ops.
- Timestamps are stored with timezone (Drizzle: `timestamp("...", { withTimezone: true })`). Render in the user's local TZ on the client.

### Skills loaded for this project

The following skills live in `.claude/skills/` and load automatically when relevant:

- **frontend-design** (Anthropic) — for UI work. Forces intentional design choices, avoids generic AI aesthetics.
- **next-best-practices** (Vercel) — for any Next.js / RSC / Server Action work. Authoritative source for App Router conventions.
- **shadcn** (shadcn/ui official) — for shadcn component work. Reads `components.json`, knows the CLI, enforces composition rules.

When working on UI, Next.js routing/data, or shadcn components, Claude consults the relevant skill first — those skills override any conflicting prior assumption. Update them periodically with `./scripts/update-skills.sh`.

---

## 2. Tech Stack (exact)

| Layer | Choice | Notes |
| --- | --- | --- |
| Language | TypeScript (strict) | No `any`. No `@ts-ignore` without a comment explaining why. |
| Runtime | Node.js 20+ | |
| Package manager | `pnpm` | Always `pnpm`, never `npm` or `yarn`. |
| Framework | Next.js 16 (App Router) | Server Components by default. |
| UI | Tailwind CSS + shadcn/ui | Components installed into `components/ui/`. |
| Icons | `lucide-react` | Only this library. No emojis as icons. |
| Forms | React Hook Form + Zod + shadcn `<Form>` | This combination, always. |
| Tables | TanStack Table v8 + shadcn data-table recipe | Headless logic, shadcn styles. |
| Validation | Zod | Single source of truth for shapes. |
| ORM | Drizzle ORM | Postgres dialect. |
| DB driver | `postgres` (postgres.js) | Not `pg`. |
| Database | PostgreSQL 18+ | Self-hosted or Neon. |
| Migrations | `drizzle-kit` | `generate` + `migrate`, not `push` in production. |
| Auth | Better-Auth | With Drizzle adapter. Not Lucia, not NextAuth. |
| File storage | Cloudflare R2 (S3-compatible) | Wrapped in `lib/storage.ts`. |
| Email | Resend + React Email | Wrapped in `lib/email.ts`. |
| Linting | ESLint + Prettier | Pre-existing config. |
| Testing | Vitest + Playwright | Vitest for unit, Playwright for E2E. |

**Do not add new dependencies without asking the user first.** Suggest the package and reasoning, wait for confirmation.

---

## 3. Commands

```bash
# Development
pnpm dev                  # Next.js dev server
pnpm build                # Production build (must pass before commit)
pnpm start                # Run prod build locally

# Quality (all must pass before declaring work done)
pnpm typecheck            # tsc --noEmit
pnpm lint                 # eslint
pnpm format               # prettier --write

# Database
pnpm db:generate          # drizzle-kit generate (after schema change)
pnpm db:migrate           # drizzle-kit migrate (apply migrations)
pnpm db:studio            # drizzle-kit studio (visual DB browser)

# UI
pnpm dlx shadcn@latest add <component>   # Add shadcn component

# Tests
pnpm test                 # Vitest unit tests
pnpm test:e2e             # Playwright
```

**Pre-commit checklist (mandatory):**
1. `pnpm typecheck` passes with zero errors
2. `pnpm lint` passes with zero warnings
3. `pnpm build` succeeds
4. New env vars added to `.env.example`

If any of these fail, fix them before claiming the task is done.

---

## 4. Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Login, signup — public
│   ├── (app)/                    # Authenticated app — protected
│   ├── api/                      # ONLY for webhooks & external integrations
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                       # shadcn components — DO NOT EDIT directly
│   └── <feature>/                # Feature-specific components
├── server/
│   ├── actions/                  # Server Actions (mutations)
│   ├── queries/                  # Read queries (cached)
│   └── auth.ts                   # Better-Auth instance
├── db/
│   ├── schema/                   # Drizzle table definitions, one file per domain
│   ├── migrations/               # Generated by drizzle-kit
│   └── index.ts                  # Drizzle client
├── lib/
│   ├── schemas/                  # Zod schemas (shared client/server)
│   ├── storage.ts                # R2 wrapper — only file that imports S3 SDK
│   ├── email.ts                  # Resend wrapper — only file that imports Resend
│   ├── utils.ts                  # cn(), formatters, etc.
│   └── env.ts                    # Validated env vars (zod)
└── hooks/                        # Custom React hooks (client-side)
```

Rules:
- Each table gets its own file in `db/schema/` (e.g., `db/schema/users.ts`).
- Server Actions live in `server/actions/<feature>.ts`, exported as named functions.
- Components named in `PascalCase.tsx`, hooks in `use-kebab-case.ts`, everything else in `kebab-case.ts`.

---

## 5. Coding Conventions

### TypeScript
- `strict: true`. Always.
- Prefer `type` for unions/primitives, `interface` for object shapes that may be extended.
- Infer types from Drizzle schemas: `type User = typeof users.$inferSelect`.
- Infer types from Zod schemas: `type CreateUserInput = z.infer<typeof createUserSchema>`.
- **Never** write a TypeScript type that duplicates a Zod or Drizzle definition.

### React / Next.js
- **Server Components by default.** Add `"use client"` only when you need state, effects, browser APIs, or event handlers.
- Data fetching happens in Server Components or Server Actions. **Never** `useEffect(() => fetch(...))` for initial data.
- Forms submit via Server Actions, not API routes.
- API routes (`app/api/`) are ONLY for: webhooks (Stripe, Resend), OAuth callbacks, public APIs consumed by third parties.
- Use `next/link` and `next/image`, never raw `<a>` (for internal links) or `<img>`.
- Use `next/navigation` `redirect()` and `revalidatePath()` after mutations.

### Styling
- Tailwind utility classes only. No CSS modules, no styled-components, no inline `style={...}` except for dynamic values.
- Use the `cn()` utility from `lib/utils.ts` for conditional classes.
- Mobile-first: write base styles for mobile, add `md:` / `lg:` for larger screens.
- Dark mode: use Tailwind's `dark:` variants. The theme is set via `next-themes`.

---

## 6. Standard Patterns (always follow these)

### 6a. Database schema (Drizzle)

```ts
// db/schema/users.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

Rules:
- IDs use `cuid2` (text PK with `$defaultFn`). Not auto-increment integers.
- Every table has `createdAt` and `updatedAt`.
- `updatedAt` uses `$onUpdate` to auto-update.
- Use snake_case for DB column names, camelCase for TS field names.
- Foreign keys: `userId: text("user_id").references(() => users.id, { onDelete: "cascade" })`.

### 6b. Zod schemas

```ts
// lib/schemas/post.ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
```

Schemas live in `lib/schemas/`. Both client (form validation) and server (action validation) import from here. **One source of truth.**

### 6c. Server Actions

Every mutation goes through this template:

```ts
// server/actions/posts.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { posts } from "@/db/schema/posts";
import { createPostSchema } from "@/lib/schemas/post";

export async function createPost(input: unknown) {
  // 1. Auth
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  // 2. Validate
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid input", issues: parsed.error.issues };
  }

  // 3. Business logic
  try {
    const [post] = await db
      .insert(posts)
      .values({ ...parsed.data, authorId: session.user.id })
      .returning();

    // 4. Revalidate / redirect
    revalidatePath("/posts");
    return { data: post };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create post" };
  }
}
```

Rules:
- Always: auth check → Zod validate → DB op → revalidate.
- Return `{ data }` or `{ error }`. Never throw to the client.
- Never trust the input — re-validate on the server even if the client validated.
- Never bypass the auth check, even for "internal" actions.

### 6d. Forms (React Hook Form + Zod + shadcn)

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createPostSchema, type CreatePostInput } from "@/lib/schemas/post";
import { createPost } from "@/server/actions/posts";

export function PostForm() {
  const form = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { title: "", content: "" },
  });

  async function onSubmit(values: CreatePostInput) {
    const result = await createPost(values);
    if (result.error) {
      form.setError("root", { message: result.error });
      return;
    }
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

Rules:
- Always use `zodResolver` with the same schema the server uses.
- Always show loading state with `formState.isSubmitting`.
- Show server errors via `form.setError("root", ...)`.
- Use `sonner` for success/error toasts (`toast.success(...)`, `toast.error(...)`).

### 6e. Tables (TanStack + shadcn)

Use the official shadcn data-table recipe. When adding a table:
- Define columns in `<feature>/columns.tsx`.
- Put the `<DataTable>` component in `<feature>/data-table.tsx`.
- Server-fetch rows in the page; pass them to the client `<DataTable>`.
- For >1000 rows, paginate server-side.
- For >10000 rows, add `@tanstack/react-virtual` virtualization.

### 6f. Auth (Better-Auth)

- The Better-Auth instance lives in `server/auth.ts`. Configure providers, Drizzle adapter, and session strategy there.
- In Server Components / Server Actions / Route Handlers: `const session = await auth.api.getSession({ headers: await headers() })` (import `headers` from `next/headers`).
- In Client Components: use the Better-Auth React hook (`useSession`) from your `auth-client`.
- Protect route groups via `app/(app)/layout.tsx` — redirect to `/login` if no session.
- **Never** check auth via cookies manually. Always go through `auth.api.getSession`.
- Note: in Next.js 16, `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are async-only — always `await` them.

### 6g. Storage (R2)

All file operations go through `lib/storage.ts`:

```ts
// lib/storage.ts (wrapper — the ONLY file that knows about S3 SDK)
export async function uploadFile(key: string, body: Buffer, contentType: string): Promise<string> { ... }
export async function getFileUrl(key: string, expiresIn?: number): Promise<string> { ... }
export async function deleteFile(key: string): Promise<void> { ... }
```

**Never** import `@aws-sdk/client-s3` outside `lib/storage.ts`. This is the rule that makes "switch from R2 to MinIO" a one-file change.

### 6h. Email (Resend + React Email)

All emails go through `lib/email.ts`. Templates live in `emails/` as React Email components. Same isolation rule as storage.

---

## 7. Environment Variables

All env vars are validated in `lib/env.ts` with Zod at startup. If a new var is needed:
1. Add it to `lib/env.ts` schema.
2. Add it to `.env.example` with a placeholder.
3. Use `env.VAR_NAME` from `lib/env.ts`, not `process.env.VAR_NAME`.

Required vars (minimum):
```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_ENDPOINT=
RESEND_API_KEY=
EMAIL_FROM=
```

---

## 8. Anti-Patterns (do not do these)

- ❌ Don't use `any`. If the type is genuinely unknown, use `unknown` and narrow.
- ❌ Don't write raw SQL strings. Use Drizzle's query builder. Exception: `db.execute(sql\`...\`)` for migrations or genuinely complex queries — but flag these for review.
- ❌ Don't use `useEffect` for data fetching. Use Server Components or Server Actions.
- ❌ Don't create an API route when a Server Action would work.
- ❌ Don't store sensitive data in `localStorage` or `sessionStorage`.
- ❌ Don't commit secrets. Always check `.env` is gitignored.
- ❌ Don't `console.log` in production paths. Use a real logger or remove.
- ❌ Don't edit files in `components/ui/` after `shadcn` generates them, unless modifying intentionally — they may be re-generated.
- ❌ Don't add new dependencies without asking the user.
- ❌ Don't use `"use client"` on a whole page when only one small component needs it. Push the boundary down.
- ❌ Don't use Supabase, Prisma, NextAuth, Lucia. They're not in this stack.
- ❌ Don't bypass auth checks "just for testing". Add a test fixture instead.
- ❌ Don't use barrel files (`index.ts` re-exporting everything) for src — they hurt tree-shaking and slow tooling.

---

## 9. When You're Stuck

If a task is unclear or the right approach isn't obvious:
1. Re-read this file. The answer is probably here.
2. Check existing code for similar patterns and follow them.
3. **Ask the user a specific question.** Don't make architectural decisions silently.
4. Don't invent new patterns when an existing one fits.

If you find yourself wanting to deviate from a rule here, **flag it explicitly** in your response and explain why before doing it.

---

## 10. Definition of Done

A task is done when:
- [ ] Feature works end-to-end as described
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] No new dependencies added without approval
- [ ] No hardcoded secrets or URLs
- [ ] If schema changed: migration generated and committed
- [ ] If env vars added: `.env.example` updated
- [ ] If user-facing: works on mobile (test at 375px width)

Don't say "done" until all of these are true.
