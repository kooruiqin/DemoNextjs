# Chat Demo — Design

**Date:** 2026-05-11
**Status:** Approved
**Owner:** UI examples folder

## Goal

Add a WhatsApp-style chat demo to `src/app/(app)/examples/chat/`. Left pane lists contacts with search and filter tabs; right pane shows the selected conversation with a message log and composer. UI-only mock — no DB, no Server Actions, no auth wiring beyond what the `(app)` route group already provides.

## Non-goals

- No persistence (no localStorage, no DB).
- No fake "reply" auto-responder — sent messages append on the user's side only.
- No typing indicator, emoji picker, attachments, presence dots.
- No real-time anything.

## Route & sidebar

- Route: `src/app/(app)/examples/chat/page.tsx` — server component, renders `<ChatShell />`.
- Sidebar: append to `examplesNav` in `src/components/app-sidebar.tsx`:
  `{ title: "Chat", href: "/examples/chat", icon: MessageCircle }`.

## Layout

A bordered, rounded card filling available height inside the existing padded `<main>`. Two-pane horizontal split:

- **Left pane** — `w-[340px] shrink-0`, right border. Contains: search input, filter tabs (`All / Unread / Groups`), scrollable contact list.
- **Right pane** — `flex-1`. Contains: chat header (avatar + name), scrollable message list, composer pinned to the bottom.

Container height: `h-[calc(100dvh-9rem)] min-h-[560px]` to leave breathing room under the sticky 14px app header + main padding.

Mobile (`<md`): one pane at a time. Left pane is shown by default; selecting a contact swaps to the chat panel. Chat header gains a back arrow on small screens that clears `selectedContactId`.

## Components

All under `src/components/chat/`. All client components except where noted.

| File | Job |
|---|---|
| `chat-shell.tsx` | Two-pane container. Owns `selectedContactId` and per-contact `messages` state. Handles pane switching on mobile. |
| `contact-list.tsx` | Search input + `Tabs` (All / Unread / Groups) + list of `ContactItem`. Owns `query` and `activeTab` state. |
| `contact-item.tsx` | One row: avatar, name, last-message snippet (1 line), relative time, unread badge if count > 0. Active state when selected. |
| `chat-panel.tsx` | Header + `MessageList` + `MessageComposer`. Empty state when no contact selected (left pane only on desktop, this pane just shows a placeholder). |
| `message-list.tsx` | Scrollable container. Renders `MessageBubble`s grouped by sender adjacency. Auto-scrolls to bottom on new messages via `useEffect` + `scrollTop`. |
| `message-bubble.tsx` | Single bubble, styled left (received) or right (`fromMe`) with timestamp. |
| `message-composer.tsx` | Auto-growing `<Textarea>` + send `Button`. Enter sends, Shift+Enter newline. Disabled while empty. |
| `mock-data.ts` | TS types + seed `CONTACTS` and `INITIAL_MESSAGES` (record keyed by contactId). |

## Data shapes

```ts
type Contact = {
  id: string;
  name: string;
  avatarUrl?: string;
  kind: "direct" | "group";
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
};

type Message = {
  id: string;
  contactId: string;
  body: string;
  sentAt: Date;
  fromMe: boolean;
};
```

Seed: ~8 contacts (mix of direct and group), each with 4–10 messages, varied timestamps across the last few days. Two or three contacts have `unreadCount > 0`.

## Behavior

- **Select a contact:** sets `selectedContactId`; that contact's `unreadCount` is zeroed in local state.
- **Send:** appends a `fromMe: true` message to that contact's message array, clears the composer, scrolls to bottom. Also updates the contact's `lastMessage` / `lastMessageAt` so the contact list reflects the latest activity.
- **Filter tabs:**
  - `All` — every contact
  - `Unread` — `unreadCount > 0`
  - `Groups` — `kind === "group"`
- **Search:** case-insensitive substring on `name`, combined with the active tab.
- **Empty states:** no contact selected → placeholder in right pane ("Select a chat to start messaging"). Filter returns nothing → "No conversations" in left pane.

## State ownership

- `ChatShell` owns: `selectedContactId`, `contacts` (mutable copy of seed), `messagesByContact` (mutable copy of seed).
- `ContactList` owns: `query`, `activeTab`. Receives `contacts` + `selectedContactId` + `onSelect`.
- `ChatPanel` owns: nothing — pure prop-driven. Receives `contact`, `messages`, `onSend`, `onBack`.
- `MessageComposer` owns: `draft` (local text).

No global state library. All state lives in `ChatShell`.

## Out of scope

Listed in **Non-goals**. If we want any of these later, they're independent extensions of the same components.
