import { unstable_cache } from "next/cache";

import { getSql, isDatabaseConfigured } from "@/lib/db";
import { defaultResumeDocument, parseResumeDocument } from "@/lib/resume-schema";

const readPublishedResume = unstable_cache(
  async () => {
    if (!isDatabaseConfigured()) {
      return { id: "repository-default", content: defaultResumeDocument };
    }

    try {
      const sql = getSql();
      const rows = await sql`
        SELECT r.id, r.content
        FROM resume_state s
        JOIN resume_revisions r ON r.id = s.published_revision_id
        WHERE s.id = 1
        LIMIT 1
      `;
      if (!rows[0]) {
        return { id: "repository-default", content: defaultResumeDocument };
      }
      return { id: rows[0].id, content: parseResumeDocument(rows[0].content) };
    } catch (error) {
      console.error("Published resume read failed; using repository fallback.", error);
      return { id: "repository-default", content: defaultResumeDocument };
    }
  },
  ["published-resume-v1"],
  { tags: ["resume-content"], revalidate: false },
);

export function getPublishedResume() {
  return readPublishedResume();
}

const readYouTubeStats = unstable_cache(
  async () => {
    if (!isDatabaseConfigured()) {
      return null;
    }
    try {
      const sql = getSql();
      const rows = await sql`
        SELECT subscriber_count, fetched_at
        FROM youtube_stats
        WHERE id = 1
      `;
      return rows[0] || null;
    } catch (error) {
      console.error("YouTube stats read failed.", error);
      return null;
    }
  },
  ["youtube-stats-v1"],
  { tags: ["youtube-stats"], revalidate: 86400 },
);

export function getYouTubeStats() {
  return readYouTubeStats();
}

export function formatCompactCount(value, fallback = "4K") {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

