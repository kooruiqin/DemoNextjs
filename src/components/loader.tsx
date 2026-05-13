"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDelayedShow } from "@/hooks/use-delayed-show";

type SpinnerSize = "sm" | "md" | "lg";

const SIZE_CLASS: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

export function Spinner({
  size = "md",
  className,
  "aria-label": ariaLabel = "Loading",
}: {
  size?: SpinnerSize;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <Loader2
      role="status"
      aria-label={ariaLabel}
      className={cn("animate-spin text-muted-foreground", SIZE_CLASS[size], className)}
    />
  );
}

export function DelayedSpinner({
  delayMs = 300,
  size = "md",
  className,
}: {
  delayMs?: number;
  size?: SpinnerSize;
  className?: string;
}) {
  const show = useDelayedShow(delayMs);
  if (!show) return null;
  return <Spinner size={size} className={className} />;
}

export function LoadingContainer({
  minHeight = 160,
  delayMs = 300,
  label,
  className,
}: {
  minHeight?: number;
  delayMs?: number;
  label?: string;
  className?: string;
}) {
  const show = useDelayedShow(delayMs);

  return (
    <div
      className={cn("flex w-full items-center justify-center", className)}
      style={{ minHeight }}
      aria-busy={show}
      aria-live="polite"
    >
      {show ? (
        <div className="flex flex-col items-center gap-2">
          <Spinner size="lg" />
          {label ? (
            <p className="text-sm text-muted-foreground">{label}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
