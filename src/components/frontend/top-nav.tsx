"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Wallet, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderUserMenu } from "@/components/header-user-menu";

type TopNavProps = {
  user: { name: string; email: string; image: string | null; role: string };
};

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/spin", label: "Spin", icon: UtensilsCrossed },
  { href: "/wallet", label: "Wallet", icon: Wallet },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

export function FrontendTopNav({ user }: TopNavProps) {
  const isActive = useIsActive();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Daily Mini home"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-sm">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="text-base">Daily Mini</span>
        </Link>

        {/* Top nav pills — desktop only. On mobile the bottom nav owns this. */}
        <nav className="hidden flex-1 items-center justify-center gap-1 sm:flex">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button asChild size="sm" variant="ghost" className="hidden gap-1.5 md:inline-flex">
            <Link href="/backend/dashboard">
              <Settings2 className="size-3.5" />
              Admin
            </Link>
          </Button>
          <Button asChild size="icon" variant="ghost" className="md:hidden" aria-label="Admin">
            <Link href="/backend/dashboard">
              <Settings2 className="size-4" />
            </Link>
          </Button>
          <ThemeToggle />
          <HeaderUserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

export function FrontendBottomNav() {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/85 backdrop-blur-xl sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground active:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active && "bg-foreground/10",
                  )}
                >
                  <item.icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
