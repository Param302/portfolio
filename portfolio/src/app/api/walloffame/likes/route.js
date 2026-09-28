import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { recordAdminAudit } from "@/lib/admin-audit";
import { getSql, isDatabaseConfigured } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestMeta } from "@/lib/request-meta";

export const dynamic = "force-dynamic";

const likeSchema = z.object({
  feedbackId: z.string().trim().regex(/^feedback_[a-f0-9]{24}$/),
  visitorId: z.string().trim().min(16).max(100),
});

export async function POST(request) {
  const meta = getRequestMeta(request);
  try {
    const input = likeSchema.parse(await request.json());
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ error: "Likes are temporarily unavailable." }, { status: 503 });
    }
    if (!await checkRateLimit({ bucket: "wall-feedback-like-global", key: "all", limit: 2000, windowSeconds: 86400 })) {
      return NextResponse.json({ error: "The daily reaction limit has been reached. Please try again tomorrow." }, { status: 429 });
    }
    if (!await checkRateLimit({ bucket: "wall-feedback-like", key: meta.ipHash, limit: 80, windowSeconds: 900 })) {
      return NextResponse.json({ error: "Too many reactions. Please try again shortly." }, { status: 429 });
    }

    const visitorHash = createHash("sha256")
      .update(`${process.env.AUDIT_SALT || "portfolio"}:${input.visitorId}`)
      .digest("hex");
    const sql = getSql();
    const rows = await sql`
      WITH inserted AS (
        INSERT INTO wall_of_fame_likes (feedback_id, visitor_hash)
        SELECT ${input.feedbackId}, ${visitorHash}
        WHERE EXISTS (SELECT 1 FROM wall_of_fame_feedbacks WHERE id = ${input.feedbackId} AND active = TRUE)
        ON CONFLICT (feedback_id, visitor_hash) DO NOTHING
        RETURNING feedback_id
      ), updated AS (
        UPDATE wall_of_fame_feedbacks
        SET like_count = like_count + 1, updated_at = NOW()
        WHERE id = ${input.feedbackId} AND EXISTS (SELECT 1 FROM inserted)
        RETURNING like_count, feedback_text
      )
      SELECT
        EXISTS (SELECT 1 FROM inserted) AS inserted,
        feedback_text,
        like_count
      FROM wall_of_fame_feedbacks
      WHERE id = ${input.feedbackId} AND active = TRUE
      LIMIT 1
    `;
    if (!rows.length) return NextResponse.json({ error: "Feedback not found." }, { status: 404 });

    const inserted = Boolean(rows[0].inserted);
    const likeCount = Number(rows[0].like_count || 0);
    if (inserted) {
      await recordAdminAudit({
        eventType: "feedback_liked",
        outcome: "success",
        meta,
        metadata: {
          feedbackId: input.feedbackId,
          likeCount,
          feedback: String(rows[0].feedback_text || "").slice(0, 180),
        },
      });
    }
    return NextResponse.json({ ok: true, liked: true, inserted, likeCount });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid feedback reaction." }, { status: 400 });
    console.error("Wall of Fame reaction failed.", error);
    return NextResponse.json({ error: "Unable to save this reaction right now." }, { status: 500 });
  }
}
