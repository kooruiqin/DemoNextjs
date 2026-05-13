import { z } from "zod";

/**
 * Source of truth for post shape. Used by:
 *   - Client form (zodResolver)
 *   - Server Action (validation)
 *   - Type inference (CreatePostInput)
 */
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string(),
});

export type UpdatePostInput = z.infer<typeof updatePostSchema>;
