import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listPosts } from "@/server/actions/posts";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default async function PostsPage() {
  const posts = await listPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">Your posts. {posts.length} total.</p>
        </div>
        <Button asChild>
          <Link href="/posts/new">New post</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={posts} />
    </div>
  );
}
