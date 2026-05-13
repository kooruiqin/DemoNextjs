import { desc, sql, gte } from "drizzle-orm";
import { db } from "@/db";
import { user, session, posts } from "@/db/schema";

export type DashboardStats = {
  userCount: number;
  sessionCount: number;
  postCount: number;
  recentPosts: Array<{
    id: string;
    title: string;
    createdAt: Date;
    authorName: string | null;
  }>;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const [userCount, sessionCount, postCount, recentPosts] = await Promise.all([
    db.$count(user),
    db.$count(session),
    db.$count(posts),
    db
      .select({
        id: posts.id,
        title: posts.title,
        createdAt: posts.createdAt,
        authorName: user.name,
      })
      .from(posts)
      .leftJoin(user, sql`${posts.authorId} = ${user.id}`)
      .orderBy(desc(posts.createdAt))
      .limit(5),
  ]);

  return { userCount, sessionCount, postCount, recentPosts };
}

export type AnalyticsData = {
  userCount: number;
  postCount: number;
  sessionCount: number;
  postsPerDay: Array<{ day: string; count: number }>;
};

export async function getAnalytics(): Promise<AnalyticsData> {
  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [userCount, postCount, sessionCount, byDay] = await Promise.all([
    db.$count(user),
    db.$count(posts),
    db.$count(session),
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${posts.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(posts)
      .where(gte(posts.createdAt, since))
      .groupBy(sql`date_trunc('day', ${posts.createdAt})`)
      .orderBy(sql`date_trunc('day', ${posts.createdAt})`),
  ]);

  const map = new Map(byDay.map((r) => [r.day, r.count]));
  const postsPerDay: Array<{ day: string; count: number }> = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    postsPerDay.push({ day: key, count: map.get(key) ?? 0 });
  }

  return { userCount, postCount, sessionCount, postsPerDay };
}
