"use client";

import * as React from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  onSend: (body: string) => void;
};

export function MessageComposer({ onSend }: Props) {
  const [draft, setDraft] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const trimmed = draft.trim();
  const canSend = trimmed.length > 0;

  function send() {
    if (!canSend) return;
    onSend(trimmed);
    setDraft("");
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t bg-background p-3">
      <Textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message"
        rows={1}
        className="max-h-32 min-h-9 resize-none"
      />
      <Button
        type="button"
        size="icon"
        disabled={!canSend}
        onClick={send}
        aria-label="Send message"
      >
        <Send className="size-4" />
      </Button>
    </div>
  );
}
