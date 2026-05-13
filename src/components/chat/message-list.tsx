"use client";

import * as React from "react";
import type { Message } from "./mock-data";
import { MessageBubble } from "./message-bubble";

type Props = {
  messages: Message[];
};

export function MessageList({ messages }: Props) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/30 to-background px-4 py-4"
    >
      {messages.map((m, i) => {
        const prev = messages[i - 1];
        const showTail = !prev || prev.fromMe !== m.fromMe;
        return <MessageBubble key={m.id} message={m} showTail={showTail} />;
      })}
    </div>
  );
}
