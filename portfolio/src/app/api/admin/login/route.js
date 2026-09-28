import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminSession } from "@/lib/auth";
import { recordAdminAudit } from "@/lib/admin-audit";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";

const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

export async function POST(request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Admin storage is not configured." }, { status: 503 });
  const meta = getRequestMeta(request);
  try {
    const input = schema.parse(await request.json());
    if (!await checkRateLimit({ bucket: "admin-login-global", key: "all", limit: 200, windowSeconds: 86400 })) {
      return NextResponse.json({ error: "Sign-in has reached its daily safety limit. Try again tomorrow." }, { status: 429 });
    }
    if (!await checkRateLimit({ bucket: "admin-login", key: meta.ipHash, limit: 8, windowSeconds: 900 })) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }
    const sql = getSql();
    const rows = await sql`SELECT id, password_hash FROM admin_users WHERE email = ${input.email.toLowerCase()} AND active = TRUE LIMIT 1`;
    if (!rows[0] || !await bcrypt.compare(input.password, rows[0].password_hash)) {
      await recordAdminAudit({ eventType: "login", outcome: "failed", meta, metadata: { email: input.email.toLowerCase() } });
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    await createAdminSession(rows[0].id, meta);
    await recordAdminAudit({ userId: rows[0].id, eventType: "login", outcome: "success", meta });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
    console.error("Admin login failed.", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
