"use client";

import * as React from "react";
import { RotateCw } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { weightedPick, type WheelOption } from "./wheel-types";
import { Confetti } from "./confetti";

export type { WheelOption } from "./wheel-types";

type WheelViewProps = {
  options: WheelOption[];
  disabled?: boolean;
  emptyState?: React.ReactNode;
  onResult?: (option: WheelOption) => void;
  /** Optional custom result renderer. Default shows a centered label. */
  renderResult?: (option: WheelOption) => React.ReactNode;
  /** Optional caption displayed under the spin button (e.g. "12 places within 3km"). */
  caption?: React.ReactNode;
  /** Reset signal — when this value changes, clear the displayed result. */
  resetKey?: string | number;
};

// Deeper warm tones in the 500–700 range so white slice labels have real
// contrast. Anything in the 300/400 range washes the text out.
const SLICE_COLORS = [
  "#ea580c", // orange-600
  "#c2410c", // orange-700
  "#d97706", // amber-600
  "#b45309", // amber-700
  "#e11d48", // rose-600
  "#be123c", // rose-700
  "#dc2626", // red-600
  "#a21caf", // fuchsia-700
] as const;

const SIZE = 360;
const RADIUS = 168;
const CENTER = SIZE / 2;
const FULL_TURNS = 6;
const SPIN_MS = 4200;

// Math.sin / Math.cos aren't bit-deterministic across runtimes (server libm vs
// browser libm), so we round to 3 decimals. SVG sub-pixel rendering is fine
// with this precision and the rounded strings agree on both ends of hydration.
const round3 = (n: number) => Math.round(n * 1000) / 1000;

function polarToCartesian(angleDeg: number, r: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: round3(CENTER + r * Math.cos(rad)),
    y: round3(CENTER + r * Math.sin(rad)),
  };
}

function sliceArcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(endAngle, RADIUS);
  const end = polarToCartesian(startAngle, RADIUS);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${CENTER} ${CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function WheelView({
  options,
  disabled = false,
  emptyState,
  onResult,
  renderResult,
  caption,
  resetKey,
}: WheelViewProps) {
  const [rotation, setRotation] = React.useState(0);
  const [spinning, setSpinning] = React.useState(false);
  const [result, setResult] = React.useState<WheelOption | null>(null);

  const n = options.length;
  const sliceAngle = n > 0 ? 360 / n : 0;

  React.useEffect(() => {
    setResult(null);
  }, [resetKey]);

  function handleSpin() {
    if (spinning || disabled || n === 0) return;
    setResult(null);
    setSpinning(true);

    const winnerIdx = weightedPick(options);
    const winnerCenter = winnerIdx * sliceAngle + sliceAngle / 2;
    const jitter = (Math.random() - 0.5) * sliceAngle * 0.6;
    const targetMod = (360 - winnerCenter + jitter + 360) % 360;

    const current = rotation;
    const currentMod = ((current % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta < 0) delta += 360;
    const next = current + FULL_TURNS * 360 + delta;
    setRotation(next);

    window.setTimeout(() => {
      setSpinning(false);
      const chosen = options[winnerIdx];
      setResult(chosen);
      onResult?.(chosen);
    }, SPIN_MS + 30);
  }

  return (
    <Card className="relative overflow-hidden border-orange-200/50 bg-gradient-to-br from-orange-50 to-rose-50/60 dark:border-orange-900/30 dark:from-orange-950/40 dark:to-rose-950/30">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_50%_40%,oklch(0.96_0.06_50/.6),transparent_70%)]"
      />
      {result ? <Confetti /> : null}
      <CardContent className="relative flex flex-col items-center gap-8 px-4 py-10 md:py-12">
        <div className="relative">
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1">
            <div className="size-0 border-x-[14px] border-t-[22px] border-x-transparent border-t-foreground drop-shadow-md" />
          </div>

          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className="size-[320px] drop-shadow-xl md:size-[380px]"
            role="img"
            aria-label="Spin wheel"
          >
            <defs>
              {/* Subtle hub highlight only — kept small so it doesn't wash out the label band. */}
              <radialGradient id="wheel-inner" cx="50%" cy="50%" r="30%">
                <stop offset="0%" stopColor="rgb(255,255,255)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="rgb(255,255,255)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: `${CENTER}px ${CENTER}px`,
                transition: spinning
                  ? `transform ${SPIN_MS}ms cubic-bezier(0.16, 0.84, 0.3, 1)`
                  : "none",
              }}
            >
              {n === 0 ? (
                <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="#e5e7eb" />
              ) : (
                options.map((opt, i) => {
                  const start = i * sliceAngle;
                  const end = (i + 1) * sliceAngle;
                  const mid = start + sliceAngle / 2;
                  const labelR = RADIUS * 0.62;
                  const labelPos = polarToCartesian(mid, labelR);
                  const color = SLICE_COLORS[i % SLICE_COLORS.length];
                  return (
                    <g key={opt.id}>
                      <path
                        d={sliceArcPath(start, end)}
                        fill={color}
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth={2}
                      />
                      <text
                        x={labelPos.x}
                        y={labelPos.y}
                        transform={`rotate(${mid} ${labelPos.x} ${labelPos.y})`}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={n > 10 ? 10 : n > 6 ? 11 : 13}
                        fontWeight={600}
                        fill="white"
                        style={{
                          paintOrder: "stroke",
                          stroke: "rgba(0,0,0,0.4)",
                          strokeWidth: 0.8,
                        }}
                      >
                        {truncate(opt.label, n > 10 ? 10 : n > 8 ? 11 : 14)}
                      </text>
                    </g>
                  );
                })
              )}
              <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#wheel-inner)" pointerEvents="none" />
            </g>
            <circle cx={CENTER} cy={CENTER} r={26} fill="white" stroke="rgba(0,0,0,0.06)" />
            <circle cx={CENTER} cy={CENTER} r={6} fill="rgb(15,23,42)" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={handleSpin}
            disabled={spinning || disabled || n === 0}
            className="h-12 gap-2 rounded-full px-8 text-base font-semibold shadow-lg shadow-orange-500/20"
          >
            <RotateCw className={cn("size-4", spinning && "animate-spin")} />
            {spinning ? "Spinning..." : result ? "Spin again" : "Spin"}
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
                {n === 0 ? emptyState ?? "No options yet." : "Tap the wheel and let chance decide."}
              </div>
            )}
          </div>

          {caption ? <div className="text-xs text-muted-foreground">{caption}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

