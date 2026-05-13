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

export function FrontendTopNav({ user }: TopNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Daily Mini home"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-sm">
            <UtensilsCrossed className="size-4" />
          </span>
          <span className="hidden text-base sm:inline">Daily Mini</span>
        </Link>

        <nav className="ml-2 flex flex-1 items-center gap-1">
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
                <span className="hidden sm:inline">{item.label}</span>
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
