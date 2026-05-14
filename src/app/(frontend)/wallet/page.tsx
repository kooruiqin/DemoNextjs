import { WalletModule } from "@/components/frontend/wallet-module";
import { listWalletEntries, listWalletLabels } from "@/server/queries/wallet";

export default async function WalletPage() {
  const [entries, labels] = await Promise.all([
    listWalletEntries(),
    listWalletLabels(),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Wallet
        </p>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Money in and out.</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          A flat ledger of entries with labels. No budgets, no categories beyond what you choose.
          Filter by kind or label to see a slice.
        </p>
      </header>

      <WalletModule entries={entries} labels={labels} />
    </div>
  );
}
