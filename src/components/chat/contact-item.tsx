"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getInitials, type Contact } from "./mock-data";

type Props = {
  contact: Contact;
  active: boolean;
  onSelect: (id: string) => void;
};

export function ContactItem({ contact, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(contact.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors",
        "hover:bg-accent/60",
        active && "bg-accent",
      )}
    >
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
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{contact.name}</span>
          <span
            className={cn(
              "shrink-0 text-xs",
              contact.unreadCount > 0
                ? "font-medium text-primary"
                : "text-muted-foreground",
            )}
          >
            {contact.lastMessageAt}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs text-muted-foreground">
            {contact.lastMessage}
          </span>
          {contact.unreadCount > 0 && (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
              {contact.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
