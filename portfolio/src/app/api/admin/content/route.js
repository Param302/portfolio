import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { recordAdminAudit } from "@/lib/admin-audit";
import { getSql } from "@/lib/db";
import { generateResumeLatex } from "@/lib/latex";
import { getRequestMeta } from "@/lib/request-meta";
import { defaultResumeDocument, resumeDocumentSchema } from "@/lib/resume-schema";

const revisionPointer = z.string().uuid().nullable();
const writeSchema = z.object({
  action: z.enum(["save", "publish", "restore", "refresh"]),
  content: resumeDocumentSchema.optional(),
  pdfBase64: z.string().max(4_000_000).optional(),
  pageCount: z.number().int().positive().max(20).optional(),
  revisionId: z.string().uuid().optional(),
  baseDraftRevisionId: revisionPointer.optional(),
  basePublishedRevisionId: revisionPointer.optional(),
});

async function loadAdminContent() {
  const sql = getSql();
  const stateRows = await sql`
    SELECT s.draft_revision_id, s.published_revision_id,
      d.content AS draft_content, p.content AS published_content
    FROM resume_state s
    LEFT JOIN resume_revisions d ON d.id = s.draft_revision_id
    LEFT JOIN resume_revisions p ON p.id = s.published_revision_id
    WHERE s.id = 1
  `;
  const history = await sql`SELECT id, status, page_count, created_at, published_at, audit FROM resume_revisions ORDER BY created_at DESC LIMIT 30`;
  const state = stateRows[0] || {};
  return { document: state.draft_content || state.published_content || defaultResumeDocument, draftRevisionId: state.draft_revision_id || null, publishedRevisionId: state.published_revision_id || null, history };
}

export async function GET() {
  try { await requireAdmin(); return NextResponse.json(await loadAdminContent()); }
  catch (error) { return NextResponse.json({ error: error.message }, { status: error.status || 500 }); }
}

export async function POST(request) {
  let admin = null;
  let meta = null;
  let requestedAction = "unknown";
  try {
    admin = await requireAdmin();
    const input = writeSchema.parse(await request.json());
    requestedAction = input.action;
    const sql = getSql();
    meta = getRequestMeta(request);
    const audit = JSON.stringify({ ip: meta.ip, ipHash: meta.ipHash, userAgent: meta.userAgent, browser: meta.browser, os: meta.os });
    if (input.action === "refresh") {
      try {
        revalidateTag("resume-content");
        revalidatePath("/");
        revalidatePath("/resume");
        await recordAdminAudit({ userId: admin.user_id, eventType: "cache_refresh", outcome: "success", meta });
        return NextResponse.json({ ok: true, cacheWarning: null, ...(await loadAdminContent()) });
      } catch (error) {
        await recordAdminAudit({ userId: admin.user_id, eventType: "cache_refresh", outcome: "failed", meta, metadata: { error: String(error.message || "Cache refresh failed").slice(0, 240) } });
        console.error("Public cache refresh failed.", error);
        return NextResponse.json({ error: "Cache refresh failed. Your published data is unchanged." }, { status: 502 });
      }
    }
    if (input.action === "restore") {
      if (input.basePublishedRevisionId === undefined) return NextResponse.json({ error: "Refresh the editor before restoring a revision." }, { status: 409 });
      const id = randomUUID();
      const rows = await sql`
        WITH current AS (
          SELECT 1 FROM resume_state WHERE id = 1 AND published_revision_id IS NOT DISTINCT FROM ${input.basePublishedRevisionId} FOR UPDATE
        ), source AS (
          SELECT content, latex_source, pdf_data, page_count FROM resume_revisions WHERE id = ${input.revisionId} AND pdf_data IS NOT NULL AND page_count = 1
        ), archived AS (
          UPDATE resume_revisions SET status = 'archived'
          WHERE status = 'published' AND EXISTS (SELECT 1 FROM current) AND EXISTS (SELECT 1 FROM source)
        ), inserted AS (
          INSERT INTO resume_revisions (id, content, latex_source, pdf_data, page_count, status, created_by, audit, published_at)
          SELECT ${id}, content, latex_source, pdf_data, page_count, 'published', ${admin.user_id}, ${audit}::jsonb, NOW()
          FROM source WHERE EXISTS (SELECT 1 FROM current) RETURNING id
        )
        UPDATE resume_state SET draft_revision_id = (SELECT id FROM inserted), published_revision_id = (SELECT id FROM inserted), updated_at = NOW()
        WHERE id = 1 AND EXISTS (SELECT 1 FROM inserted) RETURNING published_revision_id
      `;
      if (!rows[0]?.published_revision_id) return NextResponse.json({ error: "This editor is stale or that revision cannot be restored. Refresh and try again." }, { status: 409 });
    } else {
      const content = resumeDocumentSchema.parse(input.content);
      const latex = generateResumeLatex(content);
      const id = randomUUID();
      if (input.action === "save") {
        if (input.baseDraftRevisionId === undefined) return NextResponse.json({ error: "Refresh the editor before saving." }, { status: 409 });
        const rows = await sql`
          WITH current AS (
            SELECT 1 FROM resume_state WHERE id = 1 AND draft_revision_id IS NOT DISTINCT FROM ${input.baseDraftRevisionId} FOR UPDATE
          ), inserted AS (
            INSERT INTO resume_revisions (id, content, latex_source, status, created_by, audit)
            SELECT ${id}, ${JSON.stringify(content)}::jsonb, ${latex}, 'draft', ${admin.user_id}, ${audit}::jsonb
            WHERE EXISTS (SELECT 1 FROM current) RETURNING id
          )
          UPDATE resume_state SET draft_revision_id = (SELECT id FROM inserted), updated_at = NOW()
          WHERE id = 1 AND EXISTS (SELECT 1 FROM inserted) RETURNING draft_revision_id
        `;
        if (!rows[0]?.draft_revision_id) return NextResponse.json({ error: "A newer draft exists. Refresh before saving again." }, { status: 409 });
      } else {
        if (input.basePublishedRevisionId === undefined) return NextResponse.json({ error: "Refresh the editor before publishing." }, { status: 409 });
        if (input.pageCount !== 1 || !input.pdfBase64) return NextResponse.json({ error: "Publish requires a successful one-page PDF preview." }, { status: 400 });
        const pdf = Buffer.from(input.pdfBase64, "base64");
        if (pdf.length < 100 || pdf.length > 2_500_000 || pdf.subarray(0, 4).toString() !== "%PDF") return NextResponse.json({ error: "The compiled PDF is invalid or too large." }, { status: 400 });
        const rows = await sql`
          WITH current AS (
            SELECT 1 FROM resume_state WHERE id = 1 AND published_revision_id IS NOT DISTINCT FROM ${input.basePublishedRevisionId} FOR UPDATE
          ), archived AS (
            UPDATE resume_revisions SET status = 'archived' WHERE status = 'published' AND EXISTS (SELECT 1 FROM current)
          ),
          inserted AS (
            INSERT INTO resume_revisions (id, content, latex_source, pdf_data, page_count, status, created_by, audit, published_at)
            SELECT ${id}, ${JSON.stringify(content)}::jsonb, ${latex}, decode(${input.pdfBase64}, 'base64'), 1, 'published', ${admin.user_id}, ${audit}::jsonb, NOW()
            WHERE EXISTS (SELECT 1 FROM current) RETURNING id
          )
          UPDATE resume_state SET draft_revision_id = (SELECT id FROM inserted), published_revision_id = (SELECT id FROM inserted), updated_at = NOW()
          WHERE id = 1 AND EXISTS (SELECT 1 FROM inserted) RETURNING published_revision_id
        `;
        if (!rows[0]?.published_revision_id) return NextResponse.json({ error: "A newer version was published. Refresh before publishing again." }, { status: 409 });
      }
    }
    let cacheWarning = null;
    try { revalidateTag("resume-content"); revalidatePath("/"); revalidatePath("/resume"); }
    catch (error) { cacheWarning = "Saved successfully, but cache refresh should be retried."; console.error(error); }
    await recordAdminAudit({ userId: admin.user_id, eventType: input.action === "save" ? "resume_draft_saved" : input.action === "publish" ? "resume_published" : "resume_restored", outcome: "success", meta, metadata: { cacheWarning: Boolean(cacheWarning) } });
    return NextResponse.json({ ok: true, cacheWarning, ...(await loadAdminContent()) });
  } catch (error) {
    if (admin && meta) await recordAdminAudit({ userId: admin.user_id, eventType: requestedAction === "save" ? "resume_draft_saved" : requestedAction === "publish" ? "resume_published" : requestedAction === "restore" ? "resume_restored" : "resume_write", outcome: "failed", meta, metadata: { error: String(error.message || "Unable to save content").slice(0, 240) } });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Some resume fields are invalid or too long.", details: error.issues }, { status: 400 });
    console.error("Admin content write failed.", error);
    return NextResponse.json({ error: error.message || "Unable to save content." }, { status: error.status || 500 });
  }
}
