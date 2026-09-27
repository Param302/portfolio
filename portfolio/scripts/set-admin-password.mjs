import { neon } from "@neondatabase/serverless";
import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const [email, password] = process.argv.slice(2);
if (!process.env.DATABASE_URL || !email || !password) {
  console.error("Usage: DATABASE_URL=... node scripts/set-admin-password.mjs <email> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Use a password with at least 8 characters.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const passwordHash = await bcrypt.hash(password, 12);
await sql`
  INSERT INTO admin_users (id, email, password_hash)
  VALUES (${randomUUID()}, ${email.toLowerCase()}, ${passwordHash})
  ON CONFLICT (email)
  DO UPDATE SET password_hash = EXCLUDED.password_hash, active = TRUE, updated_at = NOW()
`;
console.log(`Admin password updated for ${email.toLowerCase()}.`);
