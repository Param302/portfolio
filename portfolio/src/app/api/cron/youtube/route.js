import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";

export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database maintenance is not configured." }, { status: 503 });
  try {
    const sql = getSql();
    await Promise.all([
      sql`DELETE FROM request_rate_limits WHERE window_start < NOW() - INTERVAL '7 days'`,
      sql`DELETE FROM admin_sessions WHERE (revoked_at IS NOT NULL OR expires_at < NOW()) AND created_at < NOW() - INTERVAL '30 days'`,
      sql`DELETE FROM admin_audit_events WHERE created_at < NOW() - INTERVAL '180 days'`,
      sql`
        DELETE FROM resume_revisions
        WHERE id IN (
          SELECT id FROM resume_revisions
          WHERE id NOT IN (
            SELECT draft_revision_id FROM resume_state WHERE draft_revision_id IS NOT NULL
            UNION
            SELECT published_revision_id FROM resume_state WHERE published_revision_id IS NOT NULL
          )
          ORDER BY created_at DESC
          OFFSET 30
        )
      `,
    ]);
    if (!process.env.YOUTUBE_API_KEY) return NextResponse.json({ ok: true, youtube: "skipped" });
    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "statistics"); url.searchParams.set("forHandle", "@Param3021"); url.searchParams.set("key", process.env.YOUTUBE_API_KEY);
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`YouTube returned ${response.status}`);
    const payload = await response.json();
    const count = Number(payload.items?.[0]?.statistics?.subscriberCount);
    if (!Number.isFinite(count)) throw new Error("Subscriber count was unavailable.");
    await sql`INSERT INTO youtube_stats (id, subscriber_count, fetched_at) VALUES (1, ${count}, NOW()) ON CONFLICT (id) DO UPDATE SET subscriber_count = EXCLUDED.subscriber_count, fetched_at = NOW()`;
    revalidateTag("youtube-stats");
    return NextResponse.json({ ok: true, subscriberCount: count });
  } catch (error) { console.error("YouTube refresh failed; preserving previous value.", error); return NextResponse.json({ error: "Refresh failed; the previous value was preserved." }, { status: 502 }); }
}
