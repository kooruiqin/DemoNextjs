import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WizardForm } from "./wizard-form";

export default function WizardExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Wizard</h1>
        <p className="text-sm text-muted-foreground">
          Multi-step form pattern with per-step validation and a review step.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>
            Three steps: account, profile, review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WizardForm />
        </CardContent>
      </Card>
    </div>
  );
}
