import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth";
import { getSql } from "@/lib/db";

export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get("limit")) || 40));
    const eventType = (searchParams.get("type") || "").slice(0, 80);
    const offset = (page - 1) * limit;
    const sql = getSql();
    const events = eventType
      ? await sql`SELECT id, user_id, event_type, outcome, ip_address, ip_hash, user_agent, browser, os, metadata, created_at FROM admin_audit_events WHERE event_type = ${eventType} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
      : await sql`SELECT id, user_id, event_type, outcome, ip_address, ip_hash, user_agent, browser, os, metadata, created_at FROM admin_audit_events ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    const sessions = await sql`SELECT s.user_id, u.email, s.ip_address, s.ip_hash, s.user_agent, s.browser, s.os, s.created_at, s.last_seen_at, s.expires_at, s.revoked_at FROM admin_sessions s JOIN admin_users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 50`;
    const users = await sql`SELECT id, email, active, created_at, updated_at FROM admin_users ORDER BY created_at DESC`;
    return NextResponse.json({ events, sessions, users, page, limit });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unable to load logs." }, { status: error.status || 500 });
  }
}
