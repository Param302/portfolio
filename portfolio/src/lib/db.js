import { neon } from "@neondatabase/serverless";

let client;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql() {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!client) {
    client = neon(process.env.DATABASE_URL);
  }

  return client;
}

