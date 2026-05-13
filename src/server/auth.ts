import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db } from "@/db";
import { env } from "@/lib/env";
import * as schema from "@/db/schema";

/**
 * Better-Auth server instance.
 *
 * Add providers, plugins, and config here. After changing config that
 * affects the database schema, regenerate with: pnpm auth:generate
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })],
  // No email provider yet — auto-verify users on signup. Also: the very first
  // user to sign up is promoted to admin so the system has at least one.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const existing = await db.$count(schema.user);
          return {
            data: {
              ...user,
              emailVerified: true,
              role: existing === 0 ? "admin" : "user",
            },
          };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once per day
  },
});

export type Auth = typeof auth;
