"use client";

import * as React from "react";
import { Search, MessagesSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactItem } from "./contact-item";
import type { Contact } from "./mock-data";

type Tab = "all" | "unread" | "groups";

type Props = {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelect: (id: string) => void;
};

export function ContactList({ contacts, selectedContactId, onSelect }: Props) {
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<Tab>("all");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (tab === "unread" && c.unreadCount === 0) return false;
      if (tab === "groups" && c.kind !== "group") return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [contacts, query, tab]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="space-y-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="pl-8"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
            <MessagesSquare className="size-6 opacity-50" />
            <p>No conversations</p>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filtered.map((c) => (
              <ContactItem
                key={c.id}
                contact={c}
                active={c.id === selectedContactId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
