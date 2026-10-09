# Database

Vela by Svasti ships on **SQLite** for local development, tests and the MVP
deployment. The Prisma schema is deliberately portable so the move to
**PostgreSQL** for a scaled production launch is a small, well-understood
change (no enums, no `Json` columns, no scalar arrays — constants live in
`lib/constants.ts`).

## Current setup (SQLite)

- `prisma/schema.prisma`: `datasource db { provider = "sqlite" }`
- `DATABASE_URL="file:./dev.db"` (see `.env.example`)
- Commands: `npm run db:migrate` (dev), `npm run db:deploy` (apply), `npm run db:seed`
- Customer enquiries are **no longer stored in the database** — the website
  forwards them to a Google Apps Script endpoint that writes to Google Sheets
  (see `docs/GOOGLE_SHEETS_INTEGRATION.md`). The database keeps site content,
  rooms, offers, gallery and admin users only.

## Switching to PostgreSQL (launch checklist)

1. **Provider** — in `prisma/schema.prisma`, change
   `provider = "sqlite"` → `provider = "postgresql"`.
2. **Connection** — set `DATABASE_URL="postgresql://user:pass@host:5432/vela?schema=public"`
   in the production environment (never commit it).
3. **Migrations** — Postgres migration history must be regenerated once
   (the existing SQLite migrations under `prisma/migrations/` are SQLite SQL):
   - Create the Postgres baseline: `npx prisma migrate dev --name init` against a
     scratch Postgres database, or `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql`
     then `npx prisma migrate resolve --applied 0_init`.
   - Apply for real: `npx prisma migrate deploy`.
4. **Seed** — `SEED_ADMIN_PASSWORD` **must** be set to a strong value in
   production (do not deploy with the dev default), then `npm run db:seed`.
5. **Data** — for an existing deployment without data, skip. If there is data to
   carry over, export from SQLite (`sqlite3 dev.db .dump`) and import into
   Postgres, or script it with `prisma db seed`-style ETL. The MVP has no data
   migration requirement.
6. **Verify** — run `node scripts/check-db-portability.mjs` and then smoke-test
   the enquiry round-trip (see below).

## Smoke test after switching

- `npm run typecheck && npm run build`
- Start the server, POST a valid enquiry to `/api/enquiries` → expect `201`.
  The data is written to Google Sheets via the Apps Script endpoint, not to a
  database table.
- Confirm the admin dashboard and content pages (rooms, offers, gallery) load.

## Portability guard

`node scripts/check-db-portability.mjs` fails if the schema gains a
SQLite-only construct, so this document stays accurate.
