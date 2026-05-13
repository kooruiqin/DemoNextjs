import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimpleDialogDemo } from "./simple-dialog-demo";
import { ConfirmDialogDemo } from "./confirm-dialog-demo";
import { ControlledDialogDemo } from "./controlled-dialog-demo";

export default function ModalExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Modals</h1>
        <p className="text-sm text-muted-foreground">
          Dialog patterns: form dialog, destructive confirm, and controlled state.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Form dialog</CardTitle>
            <CardDescription>
              A simple dialog containing a form. Closes on submit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleDialogDemo />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confirm action</CardTitle>
            <CardDescription>
              AlertDialog for irreversible operations. Two-step confirm.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConfirmDialogDemo />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controlled dialog</CardTitle>
            <CardDescription>
              Open state lives in the parent — close it from outside.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ControlledDialogDemo />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
