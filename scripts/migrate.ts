/**
 * Runs every .sql file in src/db/migrations in filename order.
 * Usage: bun run db:migrate   (requires DATABASE_URL)
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

const url = process.env["DATABASE_URL"];
if (!url) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const dir = join(process.cwd(), "src/db/migrations");

await sql`CREATE TABLE IF NOT EXISTS _migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`;

const applied = new Set(
  (await sql<{ name: string }[]>`SELECT name FROM _migrations`).map((r) => r.name),
);

for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (applied.has(file)) {
    console.log(`skip  ${file}`);
    continue;
  }
  const content = readFileSync(join(dir, file), "utf8");
  await sql.begin(async (tx) => {
    await tx.unsafe(content);
    await tx`INSERT INTO _migrations (name) VALUES (${file})`;
  });
  console.log(`apply ${file}`);
}

await sql.end();
console.log("Migrations up to date.");
