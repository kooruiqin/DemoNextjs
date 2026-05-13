# Page progress, post-login splash, component loaders — Design

**Date:** 2026-05-09
**Status:** Approved by user, executing in same session

## Goal

Three loader UX primitives:

1. A thin top-of-viewport progress bar during route navigation.
2. A short splash screen on the first page after login (logo + spinner).
3. A pair of small loading primitives (`Spinner`, `LoadingContainer`) for in-component waits — with a 300 ms guard so fast loads don't flash.

## Non-goals

- No global loading state machine.
- No `loading.tsx` route files added speculatively — top bar is enough for now.
- No animation library — Tailwind transitions only.

---

## 1. Top progress bar

**Dependency:** `nextjs-toploader` (pre-approved by user).

**Where:** Mounted once in `src/app/layout.tsx` at the top of `<body>`, so it covers all routes including auth pages.

**Config:**

```tsx
<NextTopLoader
  color="hsl(var(--primary))"
  height={2}
  showSpinner={false}
  shadow={false}
/>
```

No further glue — the package hooks router events itself.

---

## 2. LoginSplash on first page after login

### Trigger

Login (`(auth)/login/page.tsx`) and signup (`(auth)/signup/page.tsx`) set `sessionStorage.setItem("__splash", "1")` immediately before `router.push("/dashboard")`.

### Display

A new client component `<LoginSplash />` rendered at the top of `(app)/layout.tsx`. On mount:

1. Read `sessionStorage.getItem("__splash")`. If absent → render `null`.
2. If present → remove the flag immediately, mount a fixed full-screen overlay.
3. Overlay contents: logo (the `Command` icon used in the sidebar header), the app name "My App", a `<Spinner size="lg" />`.
4. After 1200 ms start a fade-out (Tailwind opacity transition, 200 ms).
5. After fade completes, unmount.

### Why the layout, not the dashboard page

If we put it in `dashboard/page.tsx`, an admin landing on `/users` after sign-in skips the splash. Layout placement covers every post-login entry point.

### Files

- `src/components/login-splash.tsx` (new)
- `src/app/(app)/layout.tsx` (edit) — render `<LoginSplash />`
- `src/app/(auth)/login/page.tsx` (edit) — set flag before push
- `src/app/(auth)/signup/page.tsx` (edit) — set flag before push

---

## 3. Spinner + LoadingContainer + 300 ms guard

### Hook

`src/hooks/use-delayed-show.ts` — `useDelayedShow(delayMs: number): boolean`. Returns `false` initially, then `true` after `delayMs`. Cleans up timer on unmount. The point: callers can render *nothing* until the delay elapses, so fast operations never flash a spinner.

### Components

`src/components/loader.tsx` exports:

- `<Spinner size="sm" | "md" | "lg" className?>` — pure UI: `Loader2` from lucide-react with `animate-spin`. Size maps to `size-4 / size-6 / size-8`.
- `<LoadingContainer minHeight={number} delayMs={300} label?>` — flex-centered wrapper at the given `minHeight` (px). Uses `useDelayedShow(delayMs)`; before the delay, renders an empty div of the same height so layout doesn't jump if the spinner appears. After the delay, renders `<Spinner size="lg" />` and an optional muted-foreground label.
- `<DelayedSpinner delayMs={300} size?>` — the spinner alone, gated by the same delay. For inline use (e.g., next to a button label).

### Default delay

`delayMs` defaults to 300. Override per-call when needed.

### Use cases

- `<Suspense fallback={<LoadingContainer minHeight={200} />}>` — Suspense fallback that doesn't flash.
- Cards waiting on client-side state.
- `next/dynamic({ loading: () => <LoadingContainer minHeight={120} /> })`.

---

## 4. Risks / edge cases

- **sessionStorage read in SSR:** `LoginSplash` must be a Client Component and only touch storage in `useEffect`. The initial render returns `null` until the effect runs.
- **Splash on refresh:** because the flag is removed on mount, a refresh during the 1.2 s window won't replay it (intended).
- **Splash blocks interaction:** the overlay is `fixed inset-0 z-50` with `pointer-events-auto`. 1.2 s is short enough not to be annoying.
- **Top progress + splash overlap:** the top loader will tick during the dashboard load and then the splash overlays it. That's fine; the splash's z-index is higher.
- **Theme color:** `hsl(var(--primary))` works in this project because Tailwind v4 + shadcn neo-style theme uses HSL CSS vars (per `globals.css`).

## 5. Definition of done

- Click any sidebar link → top progress bar appears and completes.
- Sign in → land on dashboard → 1.2 s splash plays once, then disappears. Refresh → no splash.
- A `<LoadingContainer>` placed inside a card with a fast-resolving Suspense boundary does *not* flash.
- `pnpm typecheck` and `pnpm build` pass.
