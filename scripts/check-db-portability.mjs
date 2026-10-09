/* eslint-disable no-undef */
/**
 * Postgres-readiness guard.
 *
 * Vela ships on SQLite but is designed for a one-line switch to PostgreSQL.
 * This script fails if prisma/schema.prisma gains a construct that would not
 * carry over, so the migration checklist in DATABASE.md stays valid.
 *
 *   node scripts/check-db-portability.mjs
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const schema = readFileSync(join(root, "prisma", "schema.prisma"), "utf8");
const code = schema.replace(/\/\/.*$/gm, "");

const problems = [];

// Native Postgres enums are not portable back to SQLite; the project keeps
// string values + TS unions in lib/constants.ts instead.
if (/\benum\s+\w+\s*\{/.test(code)) {
  problems.push("Schema declares a native `enum` — use String + lib/constants.ts unions.");
}
// Json columns differ across engines.
if (/\bJson\b/.test(code)) {
  problems.push("Schema uses a `Json` column — store serialized strings instead.");
}
// Scalar lists are Postgres-only (relation arrays like `User[]` are fine).
if (/\b(String|Int|Boolean|DateTime|Float|Decimal|Bytes)\[\]/.test(code)) {
  problems.push("Schema uses a scalar list (`Type[]`) — use a relation table instead.");
}
// Watch for SQLite-flavoured raw SQL leaking into the schema.
if (/datetime\('now'\)/i.test(code)) {
  problems.push("Schema uses SQLite date functions — use Prisma's now().");
}

if (problems.length) {
  console.error("Postgres portability check FAILED:\n" + problems.map((p) => `  - ${p}`).join("\n"));
  process.exit(1);
}

console.log("OK: prisma/schema.prisma is PostgreSQL-portable. See DATABASE.md for the switch checklist.");
