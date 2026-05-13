"use client";

import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { Post } from "@/db/schema/posts";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/server/actions/posts";

function DeleteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Delete this post?")) return;
    startTransition(async () => {
      const res = await deletePost(id);
      if (res.error) toast.error(res.error);
      else toast.success("Deleted");
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  );
}

export const columns: ColumnDef<Post>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <span className="font-medium">{row.getValue("title")}</span>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = row.getValue<Date>("createdAt");
      return <span className="text-muted-foreground">{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DeleteButton id={row.original.id} />,
  },
];
