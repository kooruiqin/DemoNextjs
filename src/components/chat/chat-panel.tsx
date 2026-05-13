"use client";

import { ArrowLeft, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import { getInitials, type Contact, type Message } from "./mock-data";

type Props = {
  contact: Contact | null;
  messages: Message[];
  onSend: (body: string) => void;
  onBack: () => void;
};

export function ChatPanel({ contact, messages, onSend, onBack }: Props) {
  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <MessageCircle className="size-7 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Select a chat</p>
          <p className="text-sm text-muted-foreground">
            Choose a conversation from the left to start messaging.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b bg-background/80 p-3 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Back to conversations"
          className="md:hidden"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <Avatar size="lg">
          <AvatarFallback
            className={cn(
              "text-sm font-medium",
              contact.kind === "group"
                ? "bg-primary/15 text-primary"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {getInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{contact.name}</div>
          <div className="text-xs text-muted-foreground">
            {contact.kind === "group" ? "Group chat" : "Direct message"}
          </div>
        </div>
      </div>

      <MessageList messages={messages} />
      <MessageComposer onSend={onSend} />
    </div>
  );
}
