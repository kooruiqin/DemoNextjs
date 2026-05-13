import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Max 100 characters"),
  email: z.email(),
  password: z
    .string()
    .min(8, "At least 8 characters")
    .max(72, "Max 72 characters"),
  role: z.enum(["user", "admin"]),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
