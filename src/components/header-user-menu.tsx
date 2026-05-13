"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User as UserIcon, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import { signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderUserMenuProps = {
  user: { name: string; email: string; image: string | null; role: string };
};

export function HeaderUserMenu({ user }: HeaderUserMenuProps) {
  const router = useRouter();

  const initials =
    user.name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || user.email[0]?.toUpperCase() || "?";

  async function handleSignOut() {
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open user menu"
          className="rounded-full"
        >
          <Avatar className="h-8 w-8">
            {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="flex items-center gap-1.5 truncate font-medium">
                {user.name}
                {user.role === "admin" ? (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    Admin
                  </Badge>
                ) : null}
              </span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/backend/profile">
            <UserIcon className="mr-2 h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/backend/settings">
            <SettingsIcon className="mr-2 h-4 w-4" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
