import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";

export async function GET(request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured() || !process.env.YOUTUBE_API_KEY) return NextResponse.json({ error: "YouTube refresh is not configured." }, { status: 503 });
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/channels");
    url.searchParams.set("part", "statistics"); url.searchParams.set("forHandle", "@Param3021"); url.searchParams.set("key", process.env.YOUTUBE_API_KEY);
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`YouTube returned ${response.status}`);
    const payload = await response.json();
    const count = Number(payload.items?.[0]?.statistics?.subscriberCount);
    if (!Number.isFinite(count)) throw new Error("Subscriber count was unavailable.");
    const sql = getSql();
    await sql`INSERT INTO youtube_stats (id, subscriber_count, fetched_at) VALUES (1, ${count}, NOW()) ON CONFLICT (id) DO UPDATE SET subscriber_count = EXCLUDED.subscriber_count, fetched_at = NOW()`;
    revalidateTag("youtube-stats");
    return NextResponse.json({ ok: true, subscriberCount: count });
  } catch (error) { console.error("YouTube refresh failed; preserving previous value.", error); return NextResponse.json({ error: "Refresh failed; the previous value was preserved." }, { status: 502 }); }
}
