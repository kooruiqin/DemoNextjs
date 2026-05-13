import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.url(),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),

  // Storage (optional — only required if using uploads)
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_ENDPOINT: z.url().optional(),
  R2_PUBLIC_URL: z.url().optional(),

  // Email (optional — only required if sending email)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.email().optional(),

  // Node env
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  // Zod 4: use z.treeifyError() instead of the removed .flatten()
  console.error(z.treeifyError(parsed.error));
  throw new Error("Invalid environment variables. Check .env.local against .env.example.");
}

export const env = parsed.data;
