import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToastDemo } from "./toast-demo";

export default function ToastExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Toasts</h1>
        <p className="text-sm text-muted-foreground">
          Sonner toast variants. Click any button to fire one.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            success / error / info / warning / promise / action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToastDemo />
        </CardContent>
      </Card>
    </div>
  );
}
