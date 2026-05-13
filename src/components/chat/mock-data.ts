export type Contact = {
  id: string;
  name: string;
  kind: "direct" | "group";
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  contactId: string;
  body: string;
  sentAt: string;
  fromMe: boolean;
};

export const CONTACTS: Contact[] = [
  {
    id: "alice",
    name: "Alice Chen",
    kind: "direct",
    lastMessage: "Sounds good — see you at 3.",
    lastMessageAt: "2m",
    unreadCount: 2,
  },
  {
    id: "design-team",
    name: "Design Team",
    kind: "group",
    lastMessage: "Maya: I pushed the new mocks 🎨",
    lastMessageAt: "14m",
    unreadCount: 5,
  },
  {
    id: "bob",
    name: "Bob Martinez",
    kind: "direct",
    lastMessage: "Did you get my email?",
    lastMessageAt: "1h",
    unreadCount: 0,
  },
  {
    id: "weekend-trip",
    name: "Weekend Trip 🏔️",
    kind: "group",
    lastMessage: "Dana: Booking confirmed!",
    lastMessageAt: "3h",
    unreadCount: 1,
  },
  {
    id: "casey",
    name: "Casey Park",
    kind: "direct",
    lastMessage: "lol that meme killed me",
    lastMessageAt: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "eng-standup",
    name: "Eng Standup",
    kind: "group",
    lastMessage: "You: Deploying to staging now",
    lastMessageAt: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "dad",
    name: "Dad",
    kind: "direct",
    lastMessage: "Call your mother.",
    lastMessageAt: "Mon",
    unreadCount: 0,
  },
  {
    id: "book-club",
    name: "Book Club 📚",
    kind: "group",
    lastMessage: "Sam: Next pick is Piranesi",
    lastMessageAt: "Sun",
    unreadCount: 0,
  },
];

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  alice: [
    { id: "a1", contactId: "alice", body: "Hey! Are we still on for coffee later?", sentAt: "2:15 PM", fromMe: false },
    { id: "a2", contactId: "alice", body: "Yes — that new place on Mission?", sentAt: "2:17 PM", fromMe: true },
    { id: "a3", contactId: "alice", body: "Perfect. 3pm?", sentAt: "2:18 PM", fromMe: false },
    { id: "a4", contactId: "alice", body: "Works for me.", sentAt: "2:19 PM", fromMe: true },
    { id: "a5", contactId: "alice", body: "Sounds good — see you at 3.", sentAt: "2:20 PM", fromMe: false },
  ],
  "design-team": [
    { id: "d1", contactId: "design-team", body: "Morning team!", sentAt: "9:02 AM", fromMe: false },
    { id: "d2", contactId: "design-team", body: "Reviewing the v2 wireframes today — anyone want to pair?", sentAt: "9:04 AM", fromMe: false },
    { id: "d3", contactId: "design-team", body: "I can jump in after lunch", sentAt: "9:11 AM", fromMe: true },
    { id: "d4", contactId: "design-team", body: "Same, free after 1pm", sentAt: "9:14 AM", fromMe: false },
    { id: "d5", contactId: "design-team", body: "Cool — booking the room", sentAt: "9:20 AM", fromMe: false },
    { id: "d6", contactId: "design-team", body: "Maya: I pushed the new mocks 🎨", sentAt: "10:46 AM", fromMe: false },
  ],
  bob: [
    { id: "b1", contactId: "bob", body: "Sent over the proposal last night, did it land?", sentAt: "11:02 AM", fromMe: false },
    { id: "b2", contactId: "bob", body: "Checking now", sentAt: "11:05 AM", fromMe: true },
    { id: "b3", contactId: "bob", body: "Did you get my email?", sentAt: "1:30 PM", fromMe: false },
  ],
  "weekend-trip": [
    { id: "w1", contactId: "weekend-trip", body: "Who's driving on Saturday?", sentAt: "8:40 AM", fromMe: false },
    { id: "w2", contactId: "weekend-trip", body: "I can take my car, fits 4", sentAt: "8:42 AM", fromMe: true },
    { id: "w3", contactId: "weekend-trip", body: "Amazing", sentAt: "8:43 AM", fromMe: false },
    { id: "w4", contactId: "weekend-trip", body: "Dana: Booking confirmed!", sentAt: "11:00 AM", fromMe: false },
  ],
  casey: [
    { id: "c1", contactId: "casey", body: "you up?", sentAt: "11:48 PM", fromMe: false },
    { id: "c2", contactId: "casey", body: "barely", sentAt: "11:49 PM", fromMe: true },
    { id: "c3", contactId: "casey", body: "lol that meme killed me", sentAt: "11:51 PM", fromMe: false },
  ],
  "eng-standup": [
    { id: "e1", contactId: "eng-standup", body: "Reminder: standup at 10", sentAt: "9:55 AM", fromMe: false },
    { id: "e2", contactId: "eng-standup", body: "Deploying to staging now", sentAt: "4:12 PM", fromMe: true },
  ],
  dad: [
    { id: "p1", contactId: "dad", body: "How's work?", sentAt: "Mon 6:02 PM", fromMe: false },
    { id: "p2", contactId: "dad", body: "Busy week. You?", sentAt: "Mon 6:30 PM", fromMe: true },
    { id: "p3", contactId: "dad", body: "Call your mother.", sentAt: "Mon 6:31 PM", fromMe: false },
  ],
  "book-club": [
    { id: "k1", contactId: "book-club", body: "Sam: Next pick is Piranesi", sentAt: "Sun 7:00 PM", fromMe: false },
  ],
};

export function getInitials(name: string): string {
  const parts = name.replace(/[^\p{L}\s]/gu, "").trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
