import Link from "next/link";
import {
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  UtensilsCrossed,
  Wallet as WalletIcon,
} from "lucide-react";

import { getSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MOCK_SPIN_RECORDS,
  MOCK_WALLET_ENTRIES,
  formatMoney,
} from "@/lib/mock/daily";

export default async function FrontendHomePage() {
  const session = await getSession();
  const firstName = session?.user.name?.split(" ")[0] ?? "there";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEntries = MOCK_WALLET_ENTRIES.filter((e) => e.occurredAt >= monthStart);
  const monthIn = monthEntries.filter((e) => e.kind === "in").reduce((s, e) => s + e.amount, 0);
  const monthOut = monthEntries.filter((e) => e.kind === "out").reduce((s, e) => s + e.amount, 0);
  const monthNet = monthIn - monthOut;

  const lastSpin = MOCK_SPIN_RECORDS[0];
  const recentSpins = MOCK_SPIN_RECORDS.slice(0, 3);
  const recentEntries = [...MOCK_WALLET_ENTRIES]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {now.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Hi {firstName}, what&apos;s the plan today?
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Two tools for the small daily decisions: spin to pick a meal, and a one-tap ledger for
          money going in and out.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <Card className="group relative overflow-hidden border-orange-200/50 bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 dark:border-orange-900/30 dark:from-orange-950/40 dark:via-rose-950/30 dark:to-amber-950/20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-orange-300/40 to-rose-300/30 blur-3xl"
          />
          <CardContent className="relative flex flex-col gap-6 p-6 md:p-7">
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg shadow-orange-500/20">
                <UtensilsCrossed className="size-5" />
              </div>
              <Badge variant="secondary" className="bg-white/70 text-foreground backdrop-blur dark:bg-white/10">
                Spin
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">Decide what to eat</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Last result: <span className="font-medium text-foreground">{lastSpin?.optionName ?? "—"}</span>
                {" "}
                <span className="text-muted-foreground">
                  ({lastSpin?.mealType})
                </span>
              </p>
            </div>

            <ul className="space-y-1.5">
              {recentSpins.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{s.optionName}</span>
                  <span className="ml-3 shrink-0 text-xs text-muted-foreground">
                    {s.mealType} · {timeAgo(s.createdAt)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">{MOCK_SPIN_RECORDS.length} spins this week</p>
              <Button asChild size="sm" className="gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                <Link href="/spin">
                  Spin the wheel
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 dark:border-emerald-900/30 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-sky-950/20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-gradient-to-br from-emerald-300/40 to-sky-300/30 blur-3xl"
          />
          <CardContent className="relative flex flex-col gap-6 p-6 md:p-7">
            <div className="flex items-start justify-between">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/20">
                <WalletIcon className="size-5" />
              </div>
              <Badge variant="secondary" className="bg-white/70 text-foreground backdrop-blur dark:bg-white/10">
                Wallet
              </Badge>
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight">This month</h2>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-semibold tabular-nums ${monthNet >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}
                >
                  {formatMoney(monthNet)}
                </span>
                <span className="text-xs text-muted-foreground">net</span>
              </div>
              <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <ArrowDownRight className="size-3 text-emerald-600" />
                  in {formatMoney(monthIn)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ArrowUpRight className="size-3 text-rose-600" />
                  out {formatMoney(monthOut)}
                </span>
              </div>
            </div>

            <ul className="space-y-1.5">
              {recentEntries.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    <span
                      className={`mr-1.5 inline-block size-1.5 rounded-full ${e.kind === "in" ? "bg-emerald-500" : "bg-rose-500"}`}
                    />
                    {e.description ?? e.place ?? "Entry"}
                  </span>
                  <span
                    className={`ml-3 shrink-0 text-xs tabular-nums ${e.kind === "in" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}
                  >
                    {e.kind === "in" ? "+" : "−"}
                    {formatMoney(e.amount)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">{monthEntries.length} entries this month</p>
              <Button asChild size="sm" className="gap-1.5 bg-foreground text-background hover:bg-foreground/90">
                <Link href="/wallet">
                  Open wallet
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 rounded-2xl border bg-card/60 p-5 backdrop-blur md:grid-cols-3">
        <Stat icon={<Check className="size-4" />} label="Spins this week" value={MOCK_SPIN_RECORDS.length.toString()} />
        <Stat icon={<ArrowDownRight className="size-4 text-emerald-600" />} label="In this month" value={formatMoney(monthIn)} />
        <Stat icon={<ArrowUpRight className="size-4 text-rose-600" />} label="Out this month" value={formatMoney(monthOut)} />
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-xl bg-muted">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-base font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function timeAgo(d: Date) {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
