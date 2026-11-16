// Proves the rates migration copies the legacy sheet, keeps edited page copy,
// and does not touch auth tables. Not part of the site runtime.
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Kysely, sql } from "kysely";
import { applySeed } from "emdash";
import { runMigrations } from "emdash/db";
import { createDialect } from "emdash/db/sqlite";
import { placeholderGroups, RATE_COLLECTION_FIELDS } from "../src/lib/rate-groups.mjs";
import { migrateRates } from "../src/lib/migrate-rates.ts";

const LEGACY_STAMP = "2024-03-15T12:00:00.000Z";
const PAGE_HEADLINE = "Brandon edited this headline";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function legacySections() {
  return placeholderGroups().map((group) => ({
    id: group.id,
    title: group.title,
    note: group.note,
    columns: `${group.tierLabel}, Interest Rate, APY`,
    rows: group.rows
      .map((row) => {
        const apy = row.apy;
        return [row.label, row.interestRate, apy].join(" | ");
      })
      .join("\n"),
  }));
}

const legacyFields = [
  { slug: "title", label: "Title", type: "string", required: true },
  { slug: "published", label: "Published note", type: "string" },
  { slug: "disclaimer", label: "Disclaimer", type: "text" },
  { slug: "full_rates_url", label: "Full rates URL", type: "url" },
  { slug: "sections_footnote", label: "Footnote", type: "text" },
  {
    slug: "items",
    label: "Featured rates",
    type: "repeater",
    validation: {
      subFields: [
        { slug: "name", label: "Name", type: "string", required: true },
        { slug: "detail", label: "Detail", type: "string" },
        { slug: "value", label: "Rate", type: "string", required: true },
      ],
    },
  },
  {
    slug: "sections",
    label: "Rate tables",
    type: "repeater",
    validation: {
      subFields: [
        { slug: "id", label: "Section id", type: "string", required: true },
        { slug: "title", label: "Title", type: "string", required: true },
        { slug: "note", label: "Note", type: "text" },
        { slug: "columns", label: "Columns", type: "string", required: true },
        { slug: "rows", label: "Rows", type: "text", required: true },
      ],
    },
  },
];

function seed(collections, content) {
  return {
    version: "1",
    meta: { name: "rate migration check" },
    collections,
    content,
  };
}

const pageCollection = {
  slug: "pages",
  label: "Pages",
  labelSingular: "Page",
  routable: false,
  titleField: "title",
  fields: [
    { slug: "title", label: "Title", type: "string", required: true },
    { slug: "headline", label: "Headline", type: "string" },
  ],
};

async function openDatabase(name) {
  const dir = mkdtempSync(path.join(tmpdir(), "tgb-rates-"));
  const db = new Kysely({ dialect: createDialect({ url: `file:${path.join(dir, name)}` }) });
  await runMigrations(db);
  return db;
}

async function authCounts(db) {
  const tables = await sql`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND (
      name LIKE '%user%' OR name LIKE '%credential%' OR name LIKE '%session%' OR name LIKE '%passkey%'
    )
  `.execute(db);
  const counts = {};
  for (const table of tables.rows) {
    const name = table.name;
    const count = await sql`SELECT COUNT(*) AS n FROM ${sql.ref(name)}`.execute(db);
    counts[name] = Number(count.rows[0].n);
  }
  return counts;
}

async function pageHeadline(db) {
  const result = await sql`SELECT headline FROM ec_pages WHERE id = 'home'`.execute(db);
  return result.rows[0]?.headline ?? null;
}

async function testLegacySheet() {
  const db = await openDatabase("legacy.db");
  const beforeAuth = await authCounts(db);
  await applySeed(
    db,
    seed(
      [
        pageCollection,
        {
          slug: "rates",
          label: "Rates",
          labelSingular: "Rate sheet",
          routable: false,
          titleField: "title",
          fields: legacyFields,
        },
      ],
      {
        pages: [{ id: "home", status: "published", data: { title: "Home", headline: PAGE_HEADLINE } }],
        rates: [
          {
            id: "rates",
            status: "published",
            data: {
              title: "Featured Rates",
              items: [
                { name: "12-Month CD", detail: "$2,500 minimum", value: "[Placeholder] 3.47%" },
                { name: "18-Month CD", detail: "$2,500 minimum", value: "[Placeholder] 3.30%" },
                { name: "Gulf Advantage Checking", detail: "Requirements apply", value: "[Placeholder] 0.80%" },
                { name: "Money Market", detail: "From $500 to open", value: "[Placeholder] up to 1.66%" },
              ],
              sections: legacySections(),
            },
          },
        ],
      },
    ),
    { includeContent: true, onConflict: "skip" },
  );
  await sql`UPDATE ec_rates SET updated_at = ${LEGACY_STAMP} WHERE id = 'rates'`.execute(db);

  assert(await migrateRates(db), "legacy migration did not finish");
  assert(await migrateRates(db), "second migration pass failed");

  const rates = await sql`
    SELECT id, slug, deleted_at, updated_at, rows FROM ec_rates
  `.execute(db);
  const live = rates.rows.filter((row) => row.deleted_at == null);
  assert(live.length === 8, `expected 8 rate groups, got ${live.length}`);
  const cd = live.find((row) => row.id === "cd-fixed");
  assert(cd, "CD group missing");
  assert(cd.updated_at === LEGACY_STAMP, `CD updated_at ${cd.updated_at} did not keep the old sheet timestamp`);
  const cdRows = JSON.parse(cd.rows);
  const oneYear = cdRows.find((row) => row.key === "cd-1-year");
  assert(oneYear?.apy === "[Placeholder] 3.47%", `featured CD APY was dropped: ${oneYear?.apy}`);
  assert(oneYear?.interest_rate === "[Placeholder] 3.40%", `CD interest rate changed: ${oneYear?.interest_rate}`);
  const market = live.find((row) => row.id === "money-market");
  const top = JSON.parse(market.rows).find((row) => row.key === "money-market-top");
  assert(top?.apy === "[Placeholder] 1.66%", `money market APY changed: ${top?.apy}`);
  assert(rates.rows.find((row) => row.id === "rates")?.deleted_at, "legacy sheet was not retired");

  const columns = await sql`SELECT name FROM pragma_table_info('ec_rates')`.execute(db);
  const names = columns.rows.map((row) => row.name);
  assert(!names.includes("sections"), "legacy sections column remains");
  assert(names.includes("rows"), "rows column missing");
  assert((await pageHeadline(db)) === PAGE_HEADLINE, "page headline changed");
  assert(JSON.stringify(await authCounts(db)) === JSON.stringify(beforeAuth), "auth tables changed");
  await db.destroy();
  console.log("legacy sheet migration ok");
}

async function testFreshSeed() {
  const db = await openDatabase("fresh.db");
  const beforeAuth = await authCounts(db);
  const groups = placeholderGroups();
  await applySeed(
    db,
    seed(
      [
        pageCollection,
        {
          slug: "rates",
          label: "Rates",
          labelSingular: "Rate group",
          description: "Deposit rates. Not current offers.",
          routable: false,
          titleField: "title",
          admin: { listColumns: ["sort_order"] },
          fields: RATE_COLLECTION_FIELDS,
        },
      ],
      {
        pages: [{ id: "home", status: "published", data: { title: "Home", headline: PAGE_HEADLINE } }],
        rates: groups.map((group) => ({
          id: group.id,
          slug: group.id,
          status: "published",
          data: {
            title: group.title,
            sort_order: group.sortOrder,
            tier_label: group.tierLabel,
            note: group.note,
            rows: group.rows.map((row) => ({
              key: row.key,
              label: row.label,
              interest_rate: row.interestRate,
              apy: row.apy,
              notes: row.notes || "",
            })),
          },
        })),
      },
    ),
    { includeContent: true, onConflict: "skip" },
  );
  assert(await migrateRates(db), "fresh migration did not finish");
  const live = await sql`SELECT id FROM ec_rates WHERE deleted_at IS NULL`.execute(db);
  assert(live.rows.length === 8, `fresh seed grew or shrank: ${live.rows.length}`);
  assert((await pageHeadline(db)) === PAGE_HEADLINE, "fresh migration changed the page");
  assert(JSON.stringify(await authCounts(db)) === JSON.stringify(beforeAuth), "fresh migration changed auth tables");
  await db.destroy();
  console.log("fresh seed migration ok");
}

await testLegacySheet();
await testFreshSeed();
