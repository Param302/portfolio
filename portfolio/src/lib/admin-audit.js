import "server-only";
import { randomUUID } from "node:crypto";

import { getSql, isDatabaseConfigured } from "@/lib/db";

export async function recordAdminAudit({ userId = null, eventType, outcome = "success", meta = {}, metadata = {} }) {
  if (!isDatabaseConfigured()) return;
  try {
    const sql = getSql();
    await sql`
      INSERT INTO admin_audit_events (id, user_id, event_type, outcome, ip_address, ip_hash, user_agent, browser, os, metadata)
      VALUES (${randomUUID()}, ${userId}, ${eventType}, ${outcome}, ${meta.ip || null}, ${meta.ipHash || null}, ${meta.userAgent || null}, ${meta.browser || null}, ${meta.os || null}, ${JSON.stringify(metadata)}::jsonb)
    `;
  } catch (error) {
    console.error("Unable to record admin audit event.", error);
  }
}
