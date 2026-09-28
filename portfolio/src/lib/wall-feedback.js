import "server-only";

import { createHash } from "node:crypto";

import { getSql, isDatabaseConfigured } from "@/lib/db";

export function feedbackId(text) {
  return `feedback_${createHash("sha256").update(text).digest("hex").slice(0, 24)}`;
}

export function normalizeWallFeedbacks(feedbacks) {
  return feedbacks.map((text, index) => ({
    id: feedbackId(text),
    text,
    likes: 0,
    order: index,
  }));
}

export async function loadWallFeedbacks(feedbacks) {
  const normalized = normalizeWallFeedbacks(feedbacks);
  if (!isDatabaseConfigured() || !normalized.length) return normalized;

  try {
    const sql = getSql();
    await sql.query(
      `INSERT INTO wall_of_fame_feedbacks (id, feedback_text, sort_order)
       SELECT seed.id, seed.feedback_text, seed.sort_order
       FROM UNNEST($1::text[], $2::text[], $3::integer[])
         AS seed(id, feedback_text, sort_order)
       ON CONFLICT (id) DO UPDATE SET
         feedback_text = EXCLUDED.feedback_text,
         sort_order = EXCLUDED.sort_order,
         active = TRUE,
         updated_at = NOW()
       WHERE wall_of_fame_feedbacks.feedback_text IS DISTINCT FROM EXCLUDED.feedback_text
          OR wall_of_fame_feedbacks.sort_order IS DISTINCT FROM EXCLUDED.sort_order
          OR wall_of_fame_feedbacks.active IS DISTINCT FROM TRUE`,
      [
        normalized.map((feedback) => feedback.id),
        normalized.map((feedback) => feedback.text),
        normalized.map((feedback) => feedback.order),
      ],
    );

    const rows = await sql`
      SELECT id, feedback_text, like_count, sort_order
      FROM wall_of_fame_feedbacks
      WHERE active = TRUE
      ORDER BY sort_order ASC
    `;
    return rows.map((row) => ({
      id: row.id,
      text: row.feedback_text,
      likes: Number(row.like_count || 0),
      order: Number(row.sort_order || 0),
    }));
  } catch (error) {
    console.error("Unable to load persisted Wall of Fame feedback.", error);
    return normalized;
  }
}
