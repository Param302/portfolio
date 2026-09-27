import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { sendContactEmail } from "@/lib/contact-email";
import { getSql } from "@/lib/db";

const updateSchema = z.object({ id: z.string().uuid(), action: z.enum(["read", "unread", "archive", "retry"]) });

export async function GET() {
  try { await requireAdmin(); const sql = getSql(); const messages = await sql`SELECT id, name, email, subject, message, status, notification_status, notification_error, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 100`; return NextResponse.json({ messages }); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: error.status || 500 }); }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    const input = updateSchema.parse(await request.json());
    const sql = getSql();
    if (input.action === "retry") {
      const rows = await sql`SELECT name, email, subject, message FROM contact_messages WHERE id = ${input.id} LIMIT 1`;
      if (!rows[0]) return NextResponse.json({ error: "Message not found." }, { status: 404 });
      try { await sendContactEmail(rows[0]); await sql`UPDATE contact_messages SET notification_status = 'sent', notification_error = NULL, updated_at = NOW() WHERE id = ${input.id}`; }
      catch (error) { await sql`UPDATE contact_messages SET notification_status = 'failed', notification_error = ${String(error.message).slice(0, 1000)}, updated_at = NOW() WHERE id = ${input.id}`; return NextResponse.json({ error: "Notification retry failed." }, { status: 502 }); }
    } else {
      const status = input.action === "archive" ? "archived" : input.action;
      await sql`UPDATE contact_messages SET status = ${status}, updated_at = NOW() WHERE id = ${input.id}`;
    }
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error.message || "Unable to update message." }, { status: error.status || 400 }); }
}
