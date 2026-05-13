import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names, respecting Tailwind's class precedence.
 * Used by all shadcn components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
