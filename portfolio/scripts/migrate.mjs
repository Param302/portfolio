import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";
import { readFile } from "node:fs/promises";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const migration = await readFile(new URL("../db/migrations/001_portfolio_admin.sql", import.meta.url), "utf8");
const sql = neon(process.env.DATABASE_URL);
const statements = migration
  .split(/;\s*(?:\r?\n|$)/)
  .map((statement) => statement.trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Portfolio database migration completed (${statements.length} statements).`);
