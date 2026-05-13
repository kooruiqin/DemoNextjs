"use client";

import { useEffect, useRef, useState } from "react";
import { Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/loader";

const SPLASH_KEY = "__splash";
const VISIBLE_MS = 1200;
const FADE_MS = 200;

type Phase = "hidden" | "visible" | "fading";

export function LoginSplash() {
  const [phase, setPhase] = useState<Phase>("hidden");
  const startedRef = useRef(false);

  // One-shot trigger: ref-guarded so React Strict Mode's double-invoke
  // doesn't re-read sessionStorage after we've already cleared it.
  useEffect(() => {
    if (startedRef.current) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_KEY) !== "1") return;
    startedRef.current = true;
    sessionStorage.removeItem(SPLASH_KEY);
    setPhase("visible");
  }, []);

  // Phase transitions are driven off `phase` itself, so each timer's
  // cleanup runs only when we actually advance — strict-mode-safe.
  useEffect(() => {
    if (phase !== "visible") return;
    const t = setTimeout(() => setPhase("fading"), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "fading") return;
    const t = setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden={phase === "fading"}
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background transition-opacity",
        phase === "fading" ? "opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="flex aspect-square size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
        <Command className="size-8" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-lg font-semibold tracking-tight">My App</p>
        <p className="text-sm text-muted-foreground">Welcome back</p>
      </div>
      <Spinner size="md" />
    </div>
  );
}

export function markSplashOnNextLoad() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SPLASH_KEY, "1");
}
