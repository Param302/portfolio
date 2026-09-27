import { NextResponse } from "next/server";
import { revokeAdminSession } from "@/lib/auth";

export async function POST() {
  await revokeAdminSession();
  return NextResponse.json({ ok: true });
}
