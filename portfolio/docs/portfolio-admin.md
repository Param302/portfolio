# Portfolio admin setup

The public portfolio has a repository fallback, so it remains available before Neon is configured. Admin writes, contact submissions, revision history, and live resume PDFs require Neon.

## Configure and seed

1. Copy `.env.example` values into `.env` or `.env.local` and Vercel project settings. The database setup scripts load both files automatically.
2. Run `npm run db:migrate` against an isolated Neon branch first.
3. Create the owner login with `npm run admin:set-password -- you@example.com "a-long-password"`.
4. Open `/admin`, sign in, confirm the PDF preview says `1 page`, then use **Save & Publish** to create the first database-backed revision.
5. Add the same variables to a Vercel Preview deployment, verify it, then migrate and seed production.

`AUDIT_SALT` and `CRON_SECRET` should be long random values. The admin password itself is never stored; the setup script writes a bcrypt hash.

## Content inputs

- Gurmat Darbar screenshots: `public/media/gurmat-darbar/`
- Codex photos: `public/media/community/codex/`
- PyDelhi photos: `public/media/community/pydelhi/`
- Raw feedback CSV/XLSX: `content-source/feedback/`

The raw feedback file is ignored by Git. Run `npm run feedback:import` after adding it; the command commits only the sanitized anonymous quote collection.

## Resume publishing guarantees

- Draft saving does not update the public site.
- Publishing requires the latest browser compile to be a valid one-page PDF.
- A stale editor tab receives a conflict response instead of replacing a newer draft or publication.
- Published content and PDF bytes are written in one database statement, then public caches are refreshed.
- `/resume.pdf`, `/resumelink`, and `/api/resume/latest` resolve to the current published PDF; immutable revision URLs remain cacheable.

The LaTeX engine, its pinned format, the template packages, and fonts are under `public/vendor/swiftlatex/`. They load only inside the authenticated admin editor.
