"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
              active
                ? "border-primary bg-primary/5 ring-2 ring-primary"
                : "hover:bg-accent",
            )}
          >
            <div
              className={cn(
                "rounded-md border px-3 py-2 text-xs font-medium",
                opt.value === "light" && "bg-white text-neutral-900",
                opt.value === "dark" && "bg-neutral-900 text-white",
                opt.value === "system" &&
                  "bg-gradient-to-r from-white to-neutral-900 text-neutral-700",
              )}
            >
              Aa
            </div>
            <div className="flex items-center gap-2 text-sm">
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
