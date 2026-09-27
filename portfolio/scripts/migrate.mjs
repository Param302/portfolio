import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const migrationDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../db/migrations");
await sql.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`);

const files = (await readdir(migrationDirectory)).filter((file) => /^\d+_.+\.sql$/i.test(file)).sort();
let appliedCount = 0;
let statementCount = 0;

for (const filename of files) {
  const existing = await sql.query("SELECT filename FROM schema_migrations WHERE filename = $1 LIMIT 1", [filename]);
  if (existing.length) continue;
  const migration = await readFile(path.join(migrationDirectory, filename), "utf8");
  const statements = migration.split(/;\s*(?:\r?\n|$)/).map((statement) => statement.trim()).filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  await sql.query("INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING", [filename]);
  appliedCount += 1;
  statementCount += statements.length;
  console.log(`Applied ${filename} (${statements.length} statements).`);
}

console.log(`Portfolio database migrations completed (${appliedCount} files, ${statementCount} statements).`);
