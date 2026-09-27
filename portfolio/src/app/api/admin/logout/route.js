import { NextResponse } from "next/server";
import { getAdminSession, revokeAdminSession } from "@/lib/auth";
import { recordAdminAudit } from "@/lib/admin-audit";
import { getRequestMeta } from "@/lib/request-meta";

export async function POST(request) {
  const session = await getAdminSession();
  if (session) await recordAdminAudit({ userId: session.user_id, eventType: "logout", outcome: "success", meta: getRequestMeta(request) });
  await revokeAdminSession();
  return NextResponse.json({ ok: true });
}
