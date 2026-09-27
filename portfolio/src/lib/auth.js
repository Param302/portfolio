import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { getSql, isDatabaseConfigured } from "@/lib/db";

const COOKIE_NAME = "portfolio_admin_session";
const SESSION_SECONDS = 60 * 60 * 24 * 14;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(userId, meta) {
  const sql = getSql();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  await sql`
    INSERT INTO admin_sessions (token_hash, user_id, expires_at, user_agent, ip_hash, ip_address, browser, os)
    VALUES (${tokenHash}, ${userId}, NOW() + INTERVAL '14 days', ${meta.userAgent}, ${meta.ipHash}, ${meta.ip}, ${meta.browser}, ${meta.os})
  `;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function revokeAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token && isDatabaseConfigured()) {
    const sql = getSql();
    await sql`UPDATE admin_sessions SET revoked_at = NOW() WHERE token_hash = ${hashToken(token)}`;
  }
  store.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  if (!isDatabaseConfigured()) return null;
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const sql = getSql();
  const rows = await sql`
    SELECT s.user_id, u.email, s.ip_address, s.ip_hash, s.user_agent, s.browser, s.os, s.created_at, s.expires_at
    FROM admin_sessions s
    JOIN admin_users u ON u.id = s.user_id
    WHERE s.token_hash = ${hashToken(token)}
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()
      AND u.active = TRUE
    LIMIT 1
  `;
  return rows[0] || null;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    const error = new Error("Authentication required.");
    error.status = 401;
    throw error;
  }
  return session;
}
