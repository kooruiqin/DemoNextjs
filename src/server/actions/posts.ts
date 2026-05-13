"use server";

import { revalidatePath } from "next/cache";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { createPostSchema, updatePostSchema } from "@/lib/schemas/post";

/**
 * Reference Server Action implementation.
 *
 * Every mutation in this codebase should follow this pattern:
 *   1. Auth check (requireSession or getSession + redirect)
 *   2. Zod validate the input
 *   3. Run DB op
 *   4. revalidatePath / revalidateTag
 *   5. Return { data } | { error }   — never throw to client
 */

type ActionResult<T> = { data: T; error?: never } | { data?: never; error: string };

export async function createPost(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();

  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const [created] = await db
      .insert(posts)
      .values({ ...parsed.data, authorId: session.user.id })
      .returning({ id: posts.id });

    revalidatePath("/posts");
    return { data: { id: created.id } };
  } catch (e) {
    console.error("createPost failed:", e);
    return { error: "Failed to create post" };
  }
}

export async function updatePost(input: unknown): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();

  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    const { id, ...rest } = parsed.data;
    const [updated] = await db
      .update(posts)
      .set(rest)
      .where(and(eq(posts.id, id), eq(posts.authorId, session.user.id)))
      .returning({ id: posts.id });

    if (!updated) return { error: "Post not found or unauthorized" };

    revalidatePath("/posts");
    return { data: { id: updated.id } };
  } catch (e) {
    console.error("updatePost failed:", e);
    return { error: "Failed to update post" };
  }
}

export async function deletePost(id: string): Promise<ActionResult<{ id: string }>> {
  const session = await requireSession();

  if (!id || typeof id !== "string") return { error: "Invalid id" };

  try {
    const [deleted] = await db
      .delete(posts)
      .where(and(eq(posts.id, id), eq(posts.authorId, session.user.id)))
      .returning({ id: posts.id });

    if (!deleted) return { error: "Post not found or unauthorized" };

    revalidatePath("/posts");
    return { data: { id: deleted.id } };
  } catch (e) {
    console.error("deletePost failed:", e);
    return { error: "Failed to delete post" };
  }
}

/**
 * Read query — call directly from Server Components, no need for Server Action wrapper.
 * Kept here for organizational consistency.
 */
export async function listPosts() {
  const session = await requireSession();

  return db
    .select()
    .from(posts)
    .where(eq(posts.authorId, session.user.id))
    .orderBy(desc(posts.createdAt));
}
