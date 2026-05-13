import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Max 50 characters"),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
