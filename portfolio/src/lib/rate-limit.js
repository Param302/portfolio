import { getSql, isDatabaseConfigured } from "@/lib/db";

const memoryBuckets = new Map();

export async function checkRateLimit({ bucket, key, limit, windowSeconds }) {
  if (!isDatabaseConfigured()) {
    const now = Date.now();
    const identifier = `${bucket}:${key}`;
    const record = memoryBuckets.get(identifier);
    if (!record || record.resetAt <= now) {
      memoryBuckets.set(identifier, { count: 1, resetAt: now + windowSeconds * 1000 });
      return true;
    }
    record.count += 1;
    return record.count <= limit;
  }

  const sql = getSql();
  const rows = await sql`
    INSERT INTO request_rate_limits (bucket, identity, window_start, request_count)
    VALUES (${bucket}, ${key}, NOW(), 1)
    ON CONFLICT (bucket, identity)
    DO UPDATE SET
      window_start = CASE
        WHEN request_rate_limits.window_start < NOW() - (${windowSeconds} * INTERVAL '1 second') THEN NOW()
        ELSE request_rate_limits.window_start
      END,
      request_count = CASE
        WHEN request_rate_limits.window_start < NOW() - (${windowSeconds} * INTERVAL '1 second') THEN 1
        ELSE request_rate_limits.request_count + 1
      END
    RETURNING request_count
  `;
  return Number(rows[0]?.request_count || 0) <= limit;
}

