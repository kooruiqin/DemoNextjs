import { desc } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  banned: boolean;
  createdAt: Date;
};

export async function listUsers(): Promise<UserListItem[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));
}
