import { ChatShell } from "@/components/chat/chat-shell";

export default function ChatExamplePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
        <p className="text-sm text-muted-foreground">
          WhatsApp-style two-pane chat. Contacts on the left, messages on the
          right. UI mock — no persistence.
        </p>
      </div>
      <ChatShell />
    </div>
  );
}
