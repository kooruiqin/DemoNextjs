"use client";

import { cn } from "@/lib/utils";
import type { Message } from "./mock-data";

type Props = {
  message: Message;
  showTail: boolean;
};

export function MessageBubble({ message, showTail }: Props) {
  const fromMe = message.fromMe;
  return (
    <div
      className={cn(
        "flex w-full",
        fromMe ? "justify-end" : "justify-start",
        showTail ? "mt-2" : "mt-0.5",
      )}
    >
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
          fromMe
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <div
          className={cn(
            "mt-1 text-[10px]",
            fromMe ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {message.sentAt}
        </div>
      </div>
    </div>
  );
}
