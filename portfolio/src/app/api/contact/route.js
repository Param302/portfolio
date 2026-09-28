import { createHash, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { sendContactEmail } from "@/lib/contact-email";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const contactSchema = z.object({ name: z.string().trim().min(1).max(120), email: z.string().trim().email().max(240), subject: z.string().trim().min(3).max(180), message: z.string().trim().min(10).max(5000), website: z.string().max(0).optional().default("") });

export async function POST(request) {
  const meta = getRequestMeta(request);
  try {
    const data = contactSchema.parse(await request.json());
    if (!isDatabaseConfigured()) return NextResponse.json({ error: "The contact form is temporarily unavailable. Please email hey@itsparam.in." }, { status: 503 });
    if (!await checkRateLimit({ bucket: "contact-global", key: "all", limit: 500, windowSeconds: 86400 })) return NextResponse.json({ error: "The contact form has reached its daily limit. Please email hey@itsparam.in." }, { status: 429 });
    if (!await checkRateLimit({ bucket: "contact", key: meta.ipHash, limit: 5, windowSeconds: 3600 })) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
    const fingerprint = createHash("sha256").update(`${data.email.toLowerCase()}|${data.subject.toLowerCase()}|${data.message.toLowerCase()}`).digest("hex");
    const id = randomUUID();
    let storedId = id;
    const sql = getSql();
    const rows = await sql`
      INSERT INTO contact_messages (id, name, email, subject, message, fingerprint, ip_address, ip_hash, user_agent)
      VALUES (${id}, ${data.name}, ${data.email.toLowerCase()}, ${data.subject}, ${data.message}, ${fingerprint}, ${meta.ip}, ${meta.ipHash}, ${meta.userAgent})
      ON CONFLICT (fingerprint) DO UPDATE SET updated_at = contact_messages.updated_at
      RETURNING id
    `;
    storedId = rows[0].id;
    if (storedId !== id) return NextResponse.json({ ok: true, duplicate: true });
    if (!await checkRateLimit({ bucket: "contact-notification-global", key: "all", limit: 100, windowSeconds: 86400 })) {
      await sql`UPDATE contact_messages SET notification_status = 'failed', notification_error = 'Daily email notification limit reached; message remains available in the admin inbox.', updated_at = NOW() WHERE id = ${storedId}`;
      return NextResponse.json({ ok: true });
    }
    try {
      await sendContactEmail(data);
      await sql`UPDATE contact_messages SET notification_status = 'sent', updated_at = NOW() WHERE id = ${storedId}`;
    } catch (mailError) {
      console.error("Contact notification failed after message persistence.", mailError);
      await sql`UPDATE contact_messages SET notification_status = 'failed', notification_error = ${String(mailError.message || "Notification failed").slice(0, 1000)}, updated_at = NOW() WHERE id = ${storedId}`;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Please check your name, email, subject, and message." }, { status: 400 });
    console.error("Contact submission failed.", error);
    return NextResponse.json({ error: "Unable to send your message right now." }, { status: 500 });
  }
}
