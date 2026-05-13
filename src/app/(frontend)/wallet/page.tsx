import { WalletModule } from "@/components/frontend/wallet-module";
import { MOCK_WALLET_ENTRIES, MOCK_WALLET_LABELS } from "@/lib/mock/daily";

export default function WalletPage() {
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

      <WalletModule entries={MOCK_WALLET_ENTRIES} labels={MOCK_WALLET_LABELS} />
    </div>
  );
}
