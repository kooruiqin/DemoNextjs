"use client";

import * as React from "react";
import { ChatPanel } from "./chat-panel";
import { ContactList } from "./contact-list";
import { CONTACTS, INITIAL_MESSAGES, type Contact, type Message } from "./mock-data";
import { cn } from "@/lib/utils";

export function ChatShell() {
  const [contacts, setContacts] = React.useState<Contact[]>(CONTACTS);
  const [messagesByContact, setMessagesByContact] = React.useState<
    Record<string, Message[]>
  >(INITIAL_MESSAGES);
  const [selectedContactId, setSelectedContactId] = React.useState<string | null>(
    CONTACTS[0]?.id ?? null,
  );

  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) ?? null;
  const messages = selectedContactId
    ? (messagesByContact[selectedContactId] ?? [])
    : [];

  function handleSelect(id: string) {
    setSelectedContactId(id);
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
    );
  }

  function handleSend(body: string) {
    if (!selectedContactId) return;
    const id = `${selectedContactId}-${Date.now()}`;
    const sentAt = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    const message: Message = {
      id,
      contactId: selectedContactId,
      body,
      sentAt,
      fromMe: true,
    };
    setMessagesByContact((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] ?? []), message],
    }));
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContactId
          ? { ...c, lastMessage: `You: ${body}`, lastMessageAt: "now" }
          : c,
      ),
    );
  }

  function handleBack() {
    setSelectedContactId(null);
  }

  const showChatOnMobile = selectedContactId !== null;

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[560px] overflow-hidden rounded-lg border bg-card shadow-sm">
      <aside
        className={cn(
          "w-full shrink-0 border-r md:w-[340px]",
          showChatOnMobile ? "hidden md:flex" : "flex",
          "flex-col",
        )}
      >
        <ContactList
          contacts={contacts}
          selectedContactId={selectedContactId}
          onSelect={handleSelect}
        />
      </aside>
      <section
        className={cn(
          "min-w-0 flex-1",
          showChatOnMobile ? "flex" : "hidden md:flex",
          "flex-col",
        )}
      >
        <ChatPanel
          contact={selectedContact}
          messages={messages}
          onSend={handleSend}
          onBack={handleBack}
        />
      </section>
    </div>
  );
}
