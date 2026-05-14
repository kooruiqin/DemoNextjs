"use client";

import * as React from "react";

const CONFETTI_COLORS = [
  "#fbbf24", // amber-400
  "#f97316", // orange-500
  "#ef4444", // red-500
  "#f43f5e", // rose-500
  "#a855f7", // purple-500
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#fde047", // yellow-300
];

/**
 * A small ribbon burst, rendered inside its positioned parent (use under a
 * `relative overflow-hidden` container). Animation keyframe `confetti-fall`
 * lives in globals.css. Designed to be conditionally mounted on each "draw
 * finish" event so React's mount cycle resets the random pieces.
 */
export function Confetti() {
  const pieces = React.useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        width: 4 + Math.random() * 4,
        height: 10 + Math.random() * 10,
        duration: 1.4 + Math.random() * 0.9,
        delay: Math.random() * 0.25,
        drift: (Math.random() - 0.5) * 90,
        rotate: (Math.random() < 0.5 ? -1 : 1) * (180 + Math.random() * 540),
        rounded: Math.random() < 0.4,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden motion-reduce:hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            borderRadius: p.rounded ? "9999px" : "1px",
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            ["--confetti-drift" as string]: `${p.drift}px`,
            ["--confetti-rotate" as string]: `${p.rotate}deg`,
          }}
        />
      ))}
    </div>
  );
}
