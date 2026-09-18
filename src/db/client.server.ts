import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let _db: PostgresJsDatabase<typeof schema> | null = null;
let _sql: ReturnType<typeof postgres> | null = null;

export function databaseConfigured(): boolean {
  return Boolean(process.env["DATABASE_URL"]);
}

export function getSql() {
  if (!_sql) {
    const url = process.env["DATABASE_URL"];
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Add it to your environment (see .env.example) so the store can reach PostgreSQL.",
      );
    }
    _sql = postgres(url, {
      max: Number(process.env["DATABASE_POOL_MAX"] ?? 10),
      ...(process.env["DATABASE_SSL"] === "true" ? { ssl: "require" as const } : {}),
    });
  }
  return _sql;
}

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(getSql(), { schema });
  }
  return _db;
}

export { schema };
