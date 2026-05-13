"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function fakeWork(ms = 1200, fail = false) {
  return new Promise<{ id: number }>((resolve, reject) => {
    setTimeout(() => {
      if (fail) reject(new Error("Network error"));
      else resolve({ id: Math.floor(Math.random() * 10000) });
    }, ms);
  });
}

export function ToastDemo() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Button onClick={() => toast.success("Saved successfully.")}>Success</Button>
      <Button variant="destructive" onClick={() => toast.error("Something broke.")}>
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info("Heads up — your trial ends in 3 days.", {
            description: "Upgrade any time from Settings.",
          })
        }
      >
        Info (with description)
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("Disk space is running low.")}
      >
        Warning
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(fakeWork(), {
            loading: "Saving record...",
            success: (d) => `Saved record #${d.id}.`,
            error: "Save failed.",
          })
        }
      >
        Promise (success)
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(fakeWork(1200, true), {
            loading: "Uploading...",
            success: "Uploaded.",
            error: (e) => (e instanceof Error ? e.message : "Upload failed."),
          })
        }
      >
        Promise (failure)
      </Button>
      <Button
        onClick={() =>
          toast("Item moved to trash.", {
            action: {
              label: "Undo",
              onClick: () => toast.success("Restored."),
            },
          })
        }
      >
        With action
      </Button>
      <Button
        variant="ghost"
        onClick={() =>
          toast("Plain toast", {
            description: "No icon, no variant — just a message.",
          })
        }
      >
        Plain
      </Button>
    </div>
  );
}
