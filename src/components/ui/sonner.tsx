"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Sonner toaster wrapper.
 *
 * Matches the current shadcn/ui pattern (sonner 2.x) which uses CSS
 * variables on the host element instead of `toastOptions.classNames`.
 *
 * Override colors per-toast via the `style` prop on individual toast()
 * calls if needed.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
export { toast } from "sonner";
