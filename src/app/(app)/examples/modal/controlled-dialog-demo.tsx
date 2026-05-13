"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ControlledDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Button variant="outline" onClick={() => setOpen(false)} disabled={!open}>
        Close from parent
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              State is owned by the parent. The button next to "Open" can dismiss it
              without any internal close button.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Use this pattern when something outside the dialog needs to drive its
            visibility — e.g., a wizard step or a global event.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
