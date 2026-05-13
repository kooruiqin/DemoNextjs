import { Users, FileText, Activity } from "lucide-react";

import { getAnalytics } from "@/server/queries/stats";
import { requireAdmin } from "@/lib/permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AnalyticsPage() {
  await requireAdmin();
  const data = await getAnalytics();
  const max = Math.max(1, ...data.postsPerDay.map((d) => d.count));
  const total30 = data.postsPerDay.reduce((s, d) => s + d.count, 0);

  const stats = [
    { label: "Total users", value: data.userCount, icon: Users },
    { label: "Total posts", value: data.postCount, icon: FileText },
    { label: "Total sessions", value: data.sessionCount, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Activity over the last 30 days.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts per day</CardTitle>
          <CardDescription>
            {total30} posts in the last 30 days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-48 items-end gap-1">
            {data.postsPerDay.map((d) => {
              const pct = (d.count / max) * 100;
              return (
                <div
                  key={d.day}
                  className="group relative flex-1"
                  title={`${d.day}: ${d.count}`}
                >
                  <div
                    className="w-full rounded-sm bg-primary/20 transition-colors group-hover:bg-primary"
                    style={{ height: `${pct}%`, minHeight: d.count > 0 ? 4 : 0 }}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{data.postsPerDay[0]?.day}</span>
            <span>{data.postsPerDay[data.postsPerDay.length - 1]?.day}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
