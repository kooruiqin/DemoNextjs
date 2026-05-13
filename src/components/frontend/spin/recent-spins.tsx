"use client";

import { Check, RotateCw, ThumbsDown, ThumbsUp, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type SpinRecord } from "@/lib/mock/daily";

type RecentSpinsProps = {
  records: SpinRecord[];
  onMark: (id: string, accepted: boolean) => void;
};

export function RecentSpins({ records, onMark }: RecentSpinsProps) {
  return (
    <aside className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight">Recent spins</h2>
        <span className="text-xs text-muted-foreground">{records.length}</span>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No spins yet. Try one.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {records.map((r) => (
            <li key={r.id}>
              <Card>
                <CardContent className="flex items-center gap-3 p-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl text-white",
                      r.mealType === "lunch"
                        ? "bg-gradient-to-br from-amber-400 to-orange-500"
                        : "bg-gradient-to-br from-rose-400 to-fuchsia-500",
                    )}
                  >
                    {r.accepted === true ? (
                      <Check className="size-4" />
                    ) : r.accepted === false ? (
                      <X className="size-4" />
                    ) : (
                      <RotateCw className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.optionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.mealType} · {timeShort(r.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant={r.accepted === true ? "default" : "ghost"}
                      className="size-7"
                      aria-label="Accepted"
                      onClick={() => onMark(r.id, true)}
                    >
                      <ThumbsUp className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant={r.accepted === false ? "default" : "ghost"}
                      className="size-7"
                      aria-label="Rejected"
                      onClick={() => onMark(r.id, false)}
                    >
                      <ThumbsDown className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function timeShort(d: Date) {
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d`;
}
