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

## Loading and refresh behavior

- The authenticated admin shell renders before panel data is available.
- Resume content loads first. Revision history, logs, and inbox then preload sequentially during browser idle time.
- Each panel has an independent refresh action. Existing data remains visible while a refresh is in progress.
- Refreshing the resume panel asks for confirmation before discarding unsaved editor changes.

## Free-tier guardrails

- The YouTube cron runs once per day and makes one `channels.list` request.
- Contact submissions are capped at 5 per IP per hour and 500 globally per day. SMTP notifications are capped at 100 per day; messages beyond that notification cap remain stored in the admin inbox.
- Wall of Fame reactions are capped at 80 per IP per 15 minutes and 2,000 globally per day.
- Admin sign-in attempts are capped at 8 per IP per 15 minutes and 200 globally per day.
- The daily cron removes stale rate-limit rows, expired sessions, audit events older than 180 days, and unreferenced resume revisions beyond the newest 30.

These are application safety ceilings, not a guarantee against provider plan changes or unusually high read traffic. Check the Vercel and Neon usage dashboards after production launches and traffic spikes.

## Pre-merge verification

From this directory, run:

```sh
npm run lint
npm run test:ml
npm run build
```

The public site has repository fallbacks, so missing database data does not fail the build. Production admin, contact, cron, and live resume features still require the environment variables in `.env.example` plus the database migrations.
