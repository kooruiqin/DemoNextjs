"use client";

import * as React from "react";
import { RotateCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { weightedPick, type WheelOption } from "./wheel-types";
import { Confetti } from "./confetti";

type SlotRollerProps = {
  options: WheelOption[];
  disabled?: boolean;
  emptyState?: React.ReactNode;
  onResult?: (option: WheelOption) => void;
  /** How to render each row (e.g. name + distance + rating). Defaults to the label. */
  renderRow?: (option: WheelOption) => React.ReactNode;
  /** What to show under the spin button after a result lands. Defaults to the label. */
  renderResult?: (option: WheelOption) => React.ReactNode;
  caption?: React.ReactNode;
  resetKey?: string | number;
};

const ROW_HEIGHT = 64;
const VISIBLE_ROWS = 5;
const CONTAINER_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;
const POINTER_Y = CONTAINER_HEIGHT / 2;
const SPIN_MS = 4500;
const MIN_CYCLES = 4;

export function SlotRoller({
  options,
  disabled = false,
  emptyState,
  onResult,
  renderRow,
  renderResult,
  caption,
  resetKey,
}: SlotRollerProps) {
  const n = options.length;
  const [idx, setIdx] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<WheelOption | null>(null);

  React.useEffect(() => {
    setIdx(0);
    setResult(null);
  }, [resetKey]);

  function handleSpin() {
    if (spinning || disabled || n === 0) return;
    setSpinning(true);
    setResult(null);

    const winnerIdx = weightedPick(options);
    const currentMod = ((idx % n) + n) % n;
    let delta = (winnerIdx - currentMod + n) % n;
    if (delta === 0) delta = n;
    const cyclesToSpin = MIN_CYCLES + Math.floor(Math.random() * 2);
    const targetIdx = idx + cyclesToSpin * n + delta;
    setIdx(targetIdx);

    window.setTimeout(() => {
      setSpinning(false);
      const chosen = options[winnerIdx];
      setResult(chosen);
      onResult?.(chosen);
    }, SPIN_MS + 30);
  }

  // Render enough rows so the strip always has content above + below the pointer.
  // Grows as user spins. Bounded by spin count, which stays small per session.
  const renderedRowCount = n === 0 ? 0 : idx + (MIN_CYCLES + 2) * n;
  const offsetPx = POINTER_Y - ROW_HEIGHT / 2 - idx * ROW_HEIGHT;

  return (
    <Card className="relative overflow-hidden border-orange-200/50 bg-gradient-to-br from-orange-50 to-rose-50/60 dark:border-orange-900/30 dark:from-orange-950/40 dark:to-rose-950/30">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_40%,oklch(0.96_0.06_50/.55),transparent_70%)]"
      />
      {result ? <Confetti /> : null}
      <CardContent className="relative flex flex-col items-center gap-8 px-4 py-10 md:py-12">
        {n === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {emptyState ?? "No options yet."}
          </div>
        ) : (
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-background/70 shadow-inner backdrop-blur"
            style={{
              height: CONTAINER_HEIGHT,
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
            }}
          >
            {/* Pointer band */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 z-10 border-y-2 border-foreground/70 bg-gradient-to-b from-white/0 via-white/15 to-white/0 dark:via-white/5"
              style={{
                top: POINTER_Y - ROW_HEIGHT / 2,
                height: ROW_HEIGHT,
              }}
            />
            {/* Notch — left */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 z-20"
              style={{ top: POINTER_Y - 8 }}
            >
              <div className="size-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-foreground drop-shadow-md" />
            </div>
            {/* Notch — right */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 z-20"
              style={{ top: POINTER_Y - 8 }}
            >
              <div className="size-0 border-y-[8px] border-r-[12px] border-y-transparent border-r-foreground drop-shadow-md" />
            </div>

            {/* Strip */}
            <div
              style={{
                transform: `translateY(${offsetPx}px)`,
                transition: spinning
                  ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 0.84, 0.3, 1)`
                  : "none",
                willChange: "transform",
              }}
            >
              {Array.from({ length: renderedRowCount }, (_, i) => {
                const opt = options[i % n];
                return (
                  <div
                    key={i}
                    className="flex items-center px-4 text-sm sm:px-6"
                    style={{ height: ROW_HEIGHT }}
                  >
                    {renderRow ? (
                      renderRow(opt)
                    ) : (
                      <span className="truncate font-medium">{opt.label}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={handleSpin}
            disabled={spinning || disabled || n === 0}
            className="h-12 gap-2 rounded-full px-8 text-base font-semibold shadow-lg shadow-orange-500/20"
          >
            <RotateCw className={cn("size-4", spinning && "animate-spin")} />
            {spinning ? "Rolling..." : result ? "Spin again" : "Spin"}
          </Button>

          <div className="min-h-[60px] text-center">
            {result ? (
              <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95">
                {renderResult ? (
                  renderResult(result)
                ) : (
                  <p className="text-2xl font-semibold tracking-tight">{result.label}</p>
                )}
              </div>
            ) : (
              <div className="max-w-sm text-sm text-muted-foreground">
                {n === 0 ? null : "Tap and let the reel decide."}
              </div>
            )}
          </div>

          {caption ? <div className="text-xs text-muted-foreground">{caption}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
