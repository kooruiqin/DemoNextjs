import Link from "next/link";
import { Users, FileText, Activity, ArrowRight } from "lucide-react";

import { getSession } from "@/lib/session";
import { getDashboardStats } from "@/server/queries/stats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await getSession();
  const stats = await getDashboardStats();

  const cards = [
    {
      label: "Users",
      value: stats.userCount,
      icon: Users,
      hint: "Total registered accounts",
    },
    {
      label: "Posts",
      value: stats.postCount,
      icon: FileText,
      hint: "Across all authors",
    },
    {
      label: "Active sessions",
      value: stats.sessionCount,
      icon: Activity,
      hint: "Currently signed-in",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session?.user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a snapshot of your application.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-xs text-muted-foreground">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent posts</CardTitle>
              <CardDescription>The last 5 posts created.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/backend/posts">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentPosts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No posts yet.{" "}
                <Link href="/backend/posts/new" className="underline">
                  Create one
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y">
                {stats.recentPosts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.authorName ?? "Unknown"} ·{" "}
                        {p.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="ml-3">
                      Post
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Common tasks for admins.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/backend/posts/new">New post</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/backend/users">Manage users</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/backend/settings">Open settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
