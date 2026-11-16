import {
  ContentRepository,
  OptionsRepository,
  SchemaRegistry,
  invalidateCollectionCache,
  invalidateSchemaObjectCache,
} from "emdash";
import { sql, type Kysely } from "kysely";
import {
  CD_GROUP_ID,
  LEGACY_RATE_FIELDS,
  MIGRATION_FLAG,
  RATE_COLLECTION_FIELDS,
  groupsFromLegacy,
  placeholderGroups,
} from "./rate-groups.mjs";

/**
 * One-time reshape of the rates collection already stored in D1.
 *
 * The previous sheet was one entry with pipe-delimited table text. This copies
 * those cells into one entry per product group and leaves every other
 * collection, including pages Brandon has edited, alone. It does not read or
 * write users, credentials, or auth tables.
 *
 * The CD entry's updated_at is set from the old sheet's updated_at so the
 * public "Rates as of" line starts at the last time that sheet was saved.
 * Later edits to other products do not move it.
 */

interface LegacyRow {
  id: string;
  slug: string | null;
  sections: unknown;
  items: unknown;
  updated_at: string | null;
}

let done = false;
let inflight: Promise<void> | null = null;

export function ensureRatesMigrated(): Promise<void> {
  if (done) return Promise.resolve();
  if (!inflight) {
    inflight = import("emdash/middleware").then(({ withEmDashRuntime }) =>
      withEmDashRuntime(async (runtime) => {
        const ok = await migrateRates(runtime.db as Kysely<unknown>);
        if (ok) done = true;
      }),
    )
      .catch((error: unknown) => {
        console.error("[rates] migration failed", error);
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || (trimmed[0] !== "[" && trimmed[0] !== "{")) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

async function fieldSlugs(db: Kysely<unknown>): Promise<string[]> {
  const result = await sql<{ slug: string }>`
    SELECT f.slug AS slug
    FROM _emdash_fields AS f
    INNER JOIN _emdash_collections AS c ON c.id = f.collection_id
    WHERE c.slug = 'rates'
  `.execute(db);
  return result.rows.map((row) => row.slug);
}

async function liveRows(db: Kysely<unknown>, legacy: boolean): Promise<LegacyRow[]> {
  const result = legacy
    ? await sql<LegacyRow>`
        SELECT id, slug, sections, items, updated_at
        FROM ec_rates
        WHERE deleted_at IS NULL
      `.execute(db)
    : await sql<LegacyRow>`
        SELECT id, slug, NULL AS sections, NULL AS items, updated_at
        FROM ec_rates
        WHERE deleted_at IS NULL
      `.execute(db);
  return result.rows;
}

function entryData(group: ReturnType<typeof placeholderGroups>[number]) {
  return {
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
  };
}

export async function migrateRates(db: Kysely<unknown>): Promise<boolean> {
  const options = new OptionsRepository(db as never);
  if ((await options.get(MIGRATION_FLAG)) === true) return true;

  const registry = new SchemaRegistry(db as never);
  const collection = await registry.getCollection("rates");
  if (!collection) return false;

  let slugs = await fieldSlugs(db);
  if (!slugs.length) return false;

  for (const field of RATE_COLLECTION_FIELDS) {
    if (field.slug === "title" || slugs.includes(field.slug)) continue;
    await registry.createField("rates", field);
  }
  slugs = await fieldSlugs(db);

  const legacy = slugs.includes("sections");
  let rows: LegacyRow[] = [];
  try {
    rows = await liveRows(db, legacy);
  } catch (error) {
    console.error("[rates] could not read ec_rates", error);
    return false;
  }

  const present = new Set(rows.map((row) => row.slug).filter((slug): slug is string => !!slug));
  if (!legacy && present.has(CD_GROUP_ID)) {
    await finish(registry, options);
    return true;
  }

  const legacyRow = rows.find((row) => row.sections != null) ?? null;
  const parsed = legacyRow
    ? groupsFromLegacy(parseJson(legacyRow.sections), parseJson(legacyRow.items))
    : null;
  const groups = parsed ?? placeholderGroups();
  const content = new ContentRepository(db as never);

  for (const group of groups) {
    if (present.has(group.id)) continue;
    await content.create({
      id: group.id,
      type: "rates",
      slug: group.id,
      status: "published",
      data: entryData(group),
    });
    present.add(group.id);
  }

  if (legacyRow?.updated_at && present.has(CD_GROUP_ID)) {
    const stamped = new Date(legacyRow.updated_at);
    if (!Number.isNaN(stamped.getTime())) {
      await sql`
        UPDATE ec_rates
        SET updated_at = ${legacyRow.updated_at}
        WHERE id = ${CD_GROUP_ID}
      `.execute(db);
    }
  }

  const groupIds = new Set(groups.map((group) => group.id));
  for (const row of rows) {
    if (groupIds.has(row.id)) continue;
    await content.delete("rates", row.id);
  }

  for (const slug of LEGACY_RATE_FIELDS) {
    if (!slugs.includes(slug)) continue;
    await registry.deleteField("rates", slug);
  }

  await finish(registry, options);
  return true;
}

async function finish(registry: SchemaRegistry, options: OptionsRepository): Promise<void> {
  await registry.updateCollection("rates", {
    label: "Rates",
    labelSingular: "Rate group",
    description: "Deposit rates. Not current offers.",
    admin: { listColumns: ["sort_order"] },
  });
  await options.set(MIGRATION_FLAG, true);
  invalidateCollectionCache("rates");
  invalidateSchemaObjectCache();
}
