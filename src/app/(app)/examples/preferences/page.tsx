import { PreferencesPanel } from "./preferences-panel";

export default function PreferencesExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Preferences</h1>
        <p className="text-sm text-muted-foreground">
          Sectioned settings layout with switches, radios, and a list.
        </p>
      </div>
      <PreferencesPanel />
    </div>
  );
}
