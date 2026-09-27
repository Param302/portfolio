import { NextResponse } from "next/server";
import { getSql, isDatabaseConfigured } from "@/lib/db";

export async function GET(_request, { params }) {
  const { revisionId } = await params;
  const fallbackUrl = new URL("/resume-static.pdf", _request.url);
  if (!isDatabaseConfigured()) return NextResponse.redirect(fallbackUrl);
  try {
    const sql = getSql();
    const rows = revisionId === "latest"
      ? await sql`SELECT r.id, r.pdf_data FROM resume_state s JOIN resume_revisions r ON r.id = s.published_revision_id WHERE s.id = 1 AND r.pdf_data IS NOT NULL LIMIT 1`
      : await sql`SELECT id, pdf_data FROM resume_revisions WHERE id = ${revisionId} AND status IN ('published', 'archived') AND pdf_data IS NOT NULL LIMIT 1`;
    if (!rows[0]) return revisionId === "latest" ? NextResponse.redirect(fallbackUrl) : NextResponse.json({ error: "Resume PDF not found." }, { status: 404 });
    const pdf = Buffer.isBuffer(rows[0].pdf_data) ? rows[0].pdf_data : Buffer.from(rows[0].pdf_data);
    return new NextResponse(pdf, { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="Parampreet-Singh-Resume-${rows[0].id}.pdf"`, "cache-control": revisionId === "latest" ? "public, max-age=0, s-maxage=3600" : "public, max-age=31536000, immutable" } });
  } catch (error) {
    console.error("Resume download failed.", error);
    return revisionId === "latest" ? NextResponse.redirect(fallbackUrl) : NextResponse.json({ error: "Resume PDF not found." }, { status: 404 });
  }
}
