"use client";

import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Shield, ShieldOff, Ban, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserListItem } from "@/server/queries/users";
import {
  setUserRole,
  banUser,
  unbanUser,
} from "@/server/actions/admin-users";

function initialsOf(name: string, email: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ||
    email[0]?.toUpperCase() ||
    "?"
  );
}

function RowActions({ user }: { user: UserListItem }) {
  const [pending, startTransition] = useTransition();

  function run(label: string, fn: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const res = await fn();
      if (res.error) toast.error(res.error);
      else toast.success(label);
    });
  }

  const isAdmin = user.role === "admin";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={pending}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Manage user</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin ? (
          <DropdownMenuItem
            onClick={() => run("Demoted to user", () => setUserRole(user.id, "user"))}
          >
            <ShieldOff className="mr-2 h-4 w-4" /> Demote to user
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => run("Promoted to admin", () => setUserRole(user.id, "admin"))}
          >
            <Shield className="mr-2 h-4 w-4" /> Promote to admin
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {user.banned ? (
          <DropdownMenuItem onClick={() => run("User unbanned", () => unbanUser(user.id))}>
            <RotateCcw className="mr-2 h-4 w-4" /> Unban user
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              const reason = prompt("Reason (optional):") ?? undefined;
              run("User banned", () => banUser(user.id, reason || undefined));
            }}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="mr-2 h-4 w-4" /> Ban user
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const columns: ColumnDef<UserListItem>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {u.image ? <AvatarImage src={u.image} alt={u.name} /> : null}
            <AvatarFallback>{initialsOf(u.name, u.email)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium">{u.name}</div>
            <div className="truncate text-xs text-muted-foreground">{u.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue<string>("role");
      return role === "admin" ? (
        <Badge>Admin</Badge>
      ) : (
        <Badge variant="outline">User</Badge>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const u = row.original;
      if (u.banned) return <Badge variant="destructive">Banned</Badge>;
      return u.emailVerified ? (
        <Badge variant="secondary">Verified</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const d = row.getValue<Date>("createdAt");
      return <span className="text-muted-foreground">{d.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions user={row.original} />,
  },
];
