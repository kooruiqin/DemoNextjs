import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "@/db/schema";

/**
 * Postgres client.
 *
 * In development, reuse the same connection across HMR reloads to avoid
 * exhausting Postgres' connection limit.
 *
 * In production (serverless), each invocation gets its own client.
 * Make sure DATABASE_URL points at the *pooled* Neon endpoint
 * (the one with `-pooler` in the hostname).
 */
const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, {
    prepare: false, // required for Neon pooler
    max: env.NODE_ENV === "production" ? 10 : 5,
  });

if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });

export type DB = typeof db;
